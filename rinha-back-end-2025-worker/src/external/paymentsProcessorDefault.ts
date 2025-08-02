import paymentsProcessorDefault from "../api/paymentsDefault";
import { HealthResponseDto } from "../dto/healthResponse.dto";
import { PaymentProcessorDto } from "../dto/payment.dto";

export class PaymentsProcessorDefault {
    constructor() {}

    async payments(payload: PaymentProcessorDto, timeout = 5000) {
        await paymentsProcessorDefault.post('/payments', payload, {
            timeout
        })
    }

    async health(): Promise<HealthResponseDto | null> {
        try {
            
            const {data} = await paymentsProcessorDefault.get<HealthResponseDto>('/payments/service-health')
            return data
        } catch (error: any) {
            console.error("PaymentsProcessorDefault.health [ERROR]: ", error.message)
            return null
        }
    }

}