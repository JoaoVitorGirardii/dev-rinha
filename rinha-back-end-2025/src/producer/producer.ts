import { PaymentDto } from '../dto/payment.dto';
import redis from '../redis/redisClient';


export async function queuePayments(payment: PaymentDto) {
    const QUEUE = 'payments'
    await redis.lpush(QUEUE, JSON.stringify(payment))
}