import { request } from "undici";
import { HealthResponseDto } from "../dto/healthResponse.dto";
import { PaymentProcessorDto } from "../dto/payment.dto";

export class PaymentsProcessorFallback {
    constructor() {}

    async payments(payload: PaymentProcessorDto, timeout = 5000) {
        const urlBase = process.env.BASE_URL_FALLBACK || 'http://payment-processor-fallback:8080';
        
        const { statusCode } = await request(`${urlBase}/payments`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'content-type': 'application/json',
                 Connection: "keep-alive",
            },
            headersTimeout: timeout,
            bodyTimeout: timeout
        });

        return statusCode === 200
    }

    async health(): Promise<HealthResponseDto | null> {
        try {
            const urlBase = process.env.BASE_URL_FALLBACK || 'http://payment-processor-fallback:8080';

            const { body } = await request(`${urlBase}/payments/service-health`, {
                method: "GET",
                bodyTimeout: 1000,
                headersTimeout: 1000,
                headers: {
                    Connection: "keep-alive"
                },
            }); 
            return (await body.json()) as HealthResponseDto
        } catch (error: any) {
            console.error("paymentsProcessorFallback.health [ERROR]: ", error.message)
            return null
        }
    }

}