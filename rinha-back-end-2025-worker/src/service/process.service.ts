import { Database } from "../database/database";
import { PaymentDto, PaymentProcessorDto } from "../dto/payment.dto";
import { PaymentsProcessorDefault } from "../external/paymentsProcessorDefault";
import { PaymentsProcessorFallback } from "../external/paymentsProcessorFallback";

export class ProcessService {  
    async payments(payload: PaymentDto){

        const paymentsProcessorDefault = new PaymentsProcessorDefault()
        const paymentsProcessorFallback = new PaymentsProcessorFallback()
        const payloadProcessor = { ...payload, requestedAt: new Date() }

        const MAX_ATTEMPTS = 2; // evita loop infinito

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
                success = true; 
            } catch (error) {
                console.error(`[Erro] Tentativa ${attempt + 1} com ${isDefault ? 'DEFAULT' : 'FALLBACK'} falhou`);
                isDefault = !isDefault; // alterna entre DEFAULT e FALLBACK
                attempt++;
            }
        }

        return 
    }

    private async paymentProcessed(payment: PaymentProcessorDto & { type: string }){

        const result = await Database.query(
            `INSERT INTO public.payments (correlationId, amount, "type", requested_at) 
             VALUES('${payment.correlationId}', ${payment.amount}, 'DEFAULT', '${new Date(payment.requestedAt).toISOString()}')`
        );

        return result
    }
}