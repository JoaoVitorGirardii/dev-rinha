import { Database } from "../database/database";
import { SummaryPaymentDto } from "../dto/summary.dto";


export async function paymentsDbSumary(payload: SummaryPaymentDto) {

    let filter = ''
    if (payload.from && payload.to) {
        filter = `WHERE requested_at BETWEEN '${payload.from}' AND '${payload.to}'`
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
            "totalRequests": Number(result.rows[0].totalRequestsDefault ?? 0),
            "totalAmount": Number(result.rows[0].totalAmountDefault ?? 0)
        },
        "fallback" : {
            "totalRequests": Number(result.rows[0].totalRequestsFallback ?? 0),
            "totalAmount": Number(result.rows[0].totalAmountFallback ?? 0)
        }
    }
    return summary;
    
}

