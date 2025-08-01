import paymentsProcessorDefault from "../api/paymentsDefault";
import { HealthResponseDto } from "../dto/healthResponse.dto";
import { PaymentProcessorDto } from "../dto/payment.dto";

export class PaymentsProcessorDefault {
    constructor() {}

    async payments(payload: PaymentProcessorDto) {
        
        await paymentsProcessorDefault.post('/payments', payload)
        
    }

    async health(): Promise<HealthResponseDto | null> {
        try {
            
            const {data} = await paymentsProcessorDefault.get<HealthResponseDto>('/payments/service-health')
            return data
        } catch (error) {
            console.error("PaymentsProcessorDefault.health [ERROR]: ")
            return null
        }
    }

}