export class PaymentDto {
    correlationId: string
    amount: number
}

export class PaymentProcessorDto {
    correlationId: string
    amount: number
    requestedAt: string | Date
}