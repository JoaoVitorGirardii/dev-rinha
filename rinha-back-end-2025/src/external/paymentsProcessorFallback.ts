import paymentsProcessorFallback from "../api/paymentsFallback";
import { HealthResponseDto } from "../dto/healthResponse.dto";
import { PaymentProcessorDto } from "../dto/payment.dto";

export class PaymentsProcessorFallback {
    constructor() {}

    async payments(payload: PaymentProcessorDto) {
        await paymentsProcessorFallback.post('/payments', payload)
    }

    async health(): Promise<HealthResponseDto | null> {
        try {
            
            const {status, data} = await paymentsProcessorFallback.get<HealthResponseDto>('/payments/service-health')
            return data
        } catch (error) {
            console.error("paymentsProcessorFallback.health [ERROR]: ")
            return null
        }
    }

}