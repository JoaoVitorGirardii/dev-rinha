import redis from '../redis/redisClient';

export async function queuePayments(payment: any) {
    const QUEUE = 'payments'
    await redis.lpush(QUEUE, JSON.stringify(payment))
}