import redis from '../redis/redisClient';

const QUEUE = 'payments'
export async function queuePayments(payment: any) {
    await redis.lpush(QUEUE, JSON.stringify(payment))
}