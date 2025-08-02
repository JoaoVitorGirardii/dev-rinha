import { PaymentsProcessorDefault } from "../external/paymentsProcessorDefault";
import { PaymentsProcessorFallback } from "../external/paymentsProcessorFallback";
import redis from "../redis/redisClient";

interface HealthCheckDto {
    hc_default: {
        failing: boolean,
        minResponseTime: number
    }
    hc_fallback: {
        failing: boolean,
        minResponseTime: number
    }
    time: Date
}
const HEALTH = 'HEALTH'

export async function healthCheckService() {
    const healthRedis = await redis.lIndex(HEALTH, 0) // primeiro da esquerda
    
    if (healthRedis) {
        const healthParsed = JSON.parse(healthRedis) as HealthCheckDto
        const { hc_default, hc_fallback } = healthParsed
       

        //se o DEFAULT e FALLBACK estiver falha
        if (hc_default.failing && hc_fallback.failing){
            return {process: 'NEXT', timeout: 0}
        }

        //USA O DEFAULT CASO O VALORES SEJAM IGUAL
        const fallback_igual_default = hc_fallback.minResponseTime === hc_default.minResponseTime
        if (hc_default.failing && hc_fallback.failing && fallback_igual_default){
            return {process: 'DEFAULT', timeout: hc_default.minResponseTime}
        }

        //USA O FALLBACK SE O TEMPO DO DEFAULT FOR MAIOR (110ms de tolerancia default é mais lucrativo)
        const fallback_menor_tempo = hc_fallback.minResponseTime < hc_default.minResponseTime + 110
        if (hc_default.failing && hc_fallback.failing && fallback_menor_tempo){
            return {process: 'FALLBACK', timeout: hc_fallback.minResponseTime}
        }

        //USA O DEFAULT SE O TEMPO FOR MENOR
        const fallback_maior_tempo = hc_fallback.minResponseTime > hc_default.minResponseTime
        if (hc_default.failing && hc_fallback.failing && fallback_maior_tempo){
            return {process: 'DEFAULT', timeout: hc_default.minResponseTime}
        }

        //se o DEFAULT estiver com falha e o FALLBACK não
        if (hc_default.failing && !hc_fallback.failing){
            return {process: 'FALLBACK', timeout: hc_fallback.minResponseTime}
        }

        //se o DEFAULT estiver sem falhas e o FALLBACK estiver falha
        if (!hc_default.failing && hc_fallback.failing){
            return {process: 'DEFAULT', timeout: hc_default.minResponseTime}
        }

    }
    return {process: 'DEFAULT', timeout: 5000}
}

export async function getHealthCheck() {
    const healthRedis = await redis.lIndex(HEALTH, 0) // primeiro da esquerda
    
    if (healthRedis){
        const paymentDefault = new PaymentsProcessorDefault()
        const paymentFallback = new PaymentsProcessorFallback()

        const healthParsed = JSON.parse(healthRedis) as HealthCheckDto
        
        const now = new Date()
        const diffInMs = now.getTime() - new Date(healthParsed.time).getTime()


        if (diffInMs > 5000){
            const hc_default_promise = paymentDefault.health()
            const hc_fallback_promise = paymentFallback.health()

            const [hc_default, hc_fallback] = await Promise.all([hc_default_promise, hc_fallback_promise])
            
            if (hc_default !== null && hc_fallback !== null) {
                await redis.lPush(HEALTH,JSON.stringify({
                    hc_default,
                    hc_fallback,
                    time: new Date()
                }))
            }else {
                const newHc = {...healthParsed, time: new Date()}
                console.log("Segundo IF: ", newHc)
                await redis.lPush(HEALTH, JSON.stringify(newHc))
            }

        }
        
    } else { // preenche com os primeiros dados
        getHealthCheckDefault()
    }

}

export async function getHealthCheckDefault() {
    const health = {
        hc_default: {
            failing: false,
            minResponseTime: 0
        },
        hc_fallback: {
            failing: false,
            minResponseTime: 0
        },
        time: new Date()
    } as HealthCheckDto
    await redis.lPush(HEALTH,JSON.stringify(health))
}