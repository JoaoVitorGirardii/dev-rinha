import { Database } from "../database/database";
import { PaymentDto, PaymentProcessorDto } from "../dto/payment.dto";
import { PaymentsProcessorDefault } from "../external/paymentsProcessorDefault";
import { PaymentsProcessorFallback } from "../external/paymentsProcessorFallback";
import redis from "../redis/redisClient";

const QUEUE = 'payments'
const BEST_SERVICE = 'BEST_SERVICE'
export async function paymentsProcessService(payload: PaymentDto){

    const paymentsProcessorDefault = new PaymentsProcessorDefault()
    const paymentsProcessorFallback = new PaymentsProcessorFallback()
    const payloadProcessor = { ...payload, requestedAt: new Date() }
    let process = 'DEFAULT'
    let timeout = 5000 //5s
    const bestService = await redis.lindex(BEST_SERVICE, 0)

    if (bestService) {
        const [ _, element ] = bestService
        if (!element) return 
        
        const bast = JSON.parse(element)

        process = bast.process
        timeout = bast.timeout
    }


    if (process === 'NEXT'){
        redis.lpush(QUEUE, JSON.stringify(payload))
        return
    }

    try {

        if (process === 'DEFAULT') {
            const ok = await paymentsProcessorDefault.payments(payloadProcessor, timeout);
            
            if (!ok) {
                await redis.lpush(QUEUE, JSON.stringify(payload))
            }else{
                await paymentProcessed({ ...payloadProcessor, type: 'DEFAULT' });
            }
            
            return
        }

        if (process === 'FALLBACK' ) {
            const ok = await paymentsProcessorFallback.payments(payloadProcessor, timeout);

            if (!ok) {
                await redis.lpush(QUEUE, JSON.stringify(payload))
            }else{
                await paymentProcessed({ ...payloadProcessor, type: 'DEFAULT' });
            }

            return
        }

    } catch (error: any) {
        await redis.lpush(QUEUE, JSON.stringify(payload))
        return
        
    }
    return 
}

async function paymentProcessed(payment: PaymentProcessorDto & { type: string }){

    Database.query(
        `INSERT INTO public.payments (correlationId, amount, "type", requested_at) 
            VALUES('${payment.correlationId}', ${payment.amount}, '${payment.type}', '${new Date(payment.requestedAt).toISOString()}')`
    );

    return
}
