import Redis from "ioredis";
const redis = new Redis({
        host: 'redis',
        port: 6379,
})

redis.on('connect', () => console.error('Redis client connected'));

redis.on('error', (err) => console.error('Redis client Error: ', err));


export default redis;