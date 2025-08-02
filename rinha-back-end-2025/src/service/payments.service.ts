import { Database } from "../database/database";
import { PaymentDto } from "../dto/payment.dto";
import { queuePayments } from "../producer/producer";

export class PaymentsService {  
    async payments(payload: PaymentDto){
        await queuePayments(payload)
        return 
    }

    async purgePayments() {
        const sql = `DELETE FROM PAYMENTS;`
        await Database.query(sql)

        return
    }
}