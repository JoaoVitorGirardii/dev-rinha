import paymentsProcessorFallback from "../api/paymentsFallback";
import { HealthResponseDto } from "../dto/healthResponse.dto";
import { PaymentProcessorDto } from "../dto/payment.dto";

export class PaymentsProcessorFallback {
    constructor() {}

    async payments(payload: PaymentProcessorDto, timeout = 5000) {
        await paymentsProcessorFallback.post('/payments', payload,{
            timeout
        })
    }

    async health(): Promise<HealthResponseDto | null> {
        try {
            
            const { data } = await paymentsProcessorFallback.get<HealthResponseDto>('/payments/service-health')
            return data
        } catch (error: any) {
            console.error("paymentsProcessorFallback.health [ERROR]: ", error.message)
            return null
        }
    }

}