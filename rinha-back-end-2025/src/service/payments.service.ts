import { Database } from "../database/database";
import { PaymentDto, PaymentProcessorDto } from "../dto/payment.dto";
import { PaymentsProcessorDefault } from "../external/paymentsProcessorDefault";
import { PaymentsProcessorFallback } from "../external/paymentsProcessorFallback";
import { sendMessage } from "../producer/producer";
import { HealthService } from "./health.service";

export class PaymentsService {  
    async payments(payload: PaymentDto){

        const paymentsProcessorDefault = new PaymentsProcessorDefault()
        const paymentsProcessorFallback = new PaymentsProcessorFallback()
        //const isDefault = await this.processInDefault()
        const payloadProcessor = { ...payload, requestedAt: new Date() }

        //adiciona na fila do rebbitMQ
        await sendMessage(payload)

        // if (isDefault){
        //     await paymentsProcessorDefault.payments(payloadProcessor)
        //     this.paymentProcessed({...payloadProcessor, type: 'DEFAULT'})
        // } else {
        //     await paymentsProcessorFallback.payments(payloadProcessor)
        //     this.paymentProcessed({...payloadProcessor, type: 'FALLBACK'})
        // }

        const MAX_ATTEMPTS = 10; // evita loop infinito

        let attempt = 0;
        let success = false;
        let isDefault = true;

        while (!success && attempt < MAX_ATTEMPTS) {
            try {
                if (isDefault) {
                await paymentsProcessorDefault.payments(payloadProcessor);
                this.paymentProcessed({ ...payloadProcessor, type: 'DEFAULT' });
                } else {
                await paymentsProcessorFallback.payments(payloadProcessor);
                this.paymentProcessed({ ...payloadProcessor, type: 'FALLBACK' });
                }
                success = true; // se chegou aqui, funcionou
            } catch (error) {
                console.error(`[Erro] Tentativa ${attempt + 1} com ${isDefault ? 'DEFAULT' : 'FALLBACK'} falhou`);
                isDefault = !isDefault; // alterna entre DEFAULT e FALLBACK
                attempt++;
            }
        }

        return 
    }

    async purgePayments() {
        const sql = `
            DELETE FROM PAYMENTS;
            DELETE FROM health_check where id not in (1,2);
        `
        await Database.query(sql)

        return
    }
    
    private async processInDefault() {
        const healthService = new HealthService()
        const lastHealthCheck = await healthService.getLastHealthCheck()

        const fall = lastHealthCheck[0].type === 'FALLBACK' ? lastHealthCheck[0] : lastHealthCheck[1]
        const def = lastHealthCheck[0].type === 'DEFAULT' ? lastHealthCheck[0] : lastHealthCheck[1]

        const TOLERANCIA = 5 //segundos
        const FIVE_SECONDS = 10000

        const now = new Date()
        const timeLastRequestAt = new Date(def.requested_at)
        const timeRequestLimit = new Date(timeLastRequestAt.getTime() + FIVE_SECONDS)

        if (timeRequestLimit < now){
            healthService.newHealthCheck()
            if (!def.failing) {

                if (def.min_response_time === fall.min_response_time){
                    return true
                }else if (def.min_response_time > (fall.min_response_time + TOLERANCIA)){
                    return false
                }

            }else {
                return false 
            }

            return true

        }else {
            if (!def.failing) {

                if (def.min_response_time === fall.min_response_time){
                    return true
                }else if (def.min_response_time > (fall.min_response_time + TOLERANCIA)){
                    return false
                }

            }else {
                return false 
            }

            return true
        }

    }

    private async paymentProcessed(payment: PaymentProcessorDto & { type: string }){

        const result = await Database.query(
            `INSERT INTO public.payments (correlationId, amount, "type", requested_at) 
             VALUES('${payment.correlationId}', ${payment.amount}, 'DEFAULT', '${new Date(payment.requestedAt).toISOString()}')`
        );

        return result
    }
}