import { Database } from "../database/database";
import { PaymentDto, PaymentProcessorDto } from "../dto/payment.dto";
import { PaymentsProcessorDefault } from "../external/paymentsProcessorDefault";
import { PaymentsProcessorFallback } from "../external/paymentsProcessorFallback";
import redis from "../redis/redisClient";
import { healthCheckService } from "./healthCheck.service";

const QUEUE = 'payments'
export class ProcessService {  
    async payments(payload: PaymentDto){

        const paymentsProcessorDefault = new PaymentsProcessorDefault()
        const paymentsProcessorFallback = new PaymentsProcessorFallback()
        const payloadProcessor = { ...payload, requestedAt: new Date() }

        const { process, timeout } = await healthCheckService()

        if (process === 'NEXT'){
            redis.rPush(QUEUE, Buffer.from(JSON.stringify(payload)))
            return
        }

        try {

            if (process === 'DEFAULT') {
                await paymentsProcessorDefault.payments(payloadProcessor, timeout);
                this.paymentProcessed({ ...payloadProcessor, type: 'DEFAULT' });
                return
            }

            if (process === 'FALLBACK' ) {
                await paymentsProcessorFallback.payments(payloadProcessor, timeout);
                this.paymentProcessed({ ...payloadProcessor, type: 'FALLBACK' });
                return
            }

        } catch (error: any) {
            await redis.rPush(QUEUE, Buffer.from(JSON.stringify(payload)))
            return
            
        }

        return 
    }

    private async paymentProcessed(payment: PaymentProcessorDto & { type: string }){

        const result = await Database.query(
            `INSERT INTO public.payments (correlationId, amount, "type", requested_at) 
             VALUES('${payment.correlationId}', ${payment.amount}, '${payment.type}', '${new Date(payment.requestedAt).toISOString()}')`
        );

        return result
    }
}