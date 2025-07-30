import { Database } from "../database/database";
import { SummaryPaymentDto } from "../dto/summary.dto";

export class SummaryService {
    constructor() {}

    async payments(payload: SummaryPaymentDto) {
    
        let filter = ''
        if (payload.from && payload.to) {
            filter = `WHERE requested_at BETWEEN '${new Date(payload.from).toISOString()}' AND '${new Date(payload.to).toISOString()}'`
        }

        const result = await Database.query(
            `SELECT COUNT(*) FILTER(WHERE "type" = 'DEFAULT') AS "totalRequestsDefault",
                    COUNT(*) FILTER(WHERE "type" = 'FALLBACK') AS "totalRequestsFallback",
                    SUM(amount) FILTER(WHERE "type" = 'FALLBACK') AS "totalAmountFallback",
                    SUM(amount) FILTER(WHERE "type" = 'DEFAULT') AS "totalAmountDefault"
               FROM payments
              ${filter}
            `
        );
    
        const summary = {
            "default" : {
                "totalRequests": result.rows[0].totalRequestsDefault,
                "totalAmount": result.rows[0].totalAmountDefault
            },
            "fallback" : {
                "totalRequests": result.rows[0].totalRequestsFallback,
                "totalAmount": result.rows[0].totalAmountFallback
            }
        }
        return summary;
        
    }

}