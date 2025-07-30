import { Database } from "../database/database";
import { PaymentsProcessorDefault } from "../external/paymentsProcessorDefault";
import { PaymentsProcessorFallback } from "../external/paymentsProcessorFallback";

export class HealthService {
    constructor() {}

    // consulta ultima saude da api
    async getLastHealthCheck() {
        const result = await Database.query(`
            SELECT * 
              FROM health_check
             ORDER BY id DESC 
             LIMIT 2`)
        
        return result.rows
    }

    // realiza uma nova consulta
    async newHealthCheck() {
        const paymentsProcessorDefault = new PaymentsProcessorDefault()
        const paymentsProcessorFallback = new PaymentsProcessorFallback()

        const promiseHealthDefault = paymentsProcessorDefault.health()
        const promiseHealthFallback = paymentsProcessorFallback.health()
        const [healthDefault, healthFallback] = await Promise.all([promiseHealthDefault, promiseHealthFallback])

        if (healthDefault && healthFallback){
            const sqlInsert = `
                INSERT INTO public.health_check
                (id, failing, requested_at, min_response_time, "type")
                VALUES
                (nextval('health_check_id_seq'::regclass), ${healthDefault.failing}, NOW(), ${healthDefault.minResponseTime}, 'DEFAULT'),
                (nextval('health_check_id_seq'::regclass), ${healthFallback.failing}, NOW(), ${healthFallback.minResponseTime}, 'FALLBACK');
            `
            await Database.query(sqlInsert)
        }


    }
}