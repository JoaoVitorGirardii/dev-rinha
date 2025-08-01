import { Database } from "../database/database";
import { PaymentDto } from "../dto/payment.dto";
import { sendMessage } from "../producer/producer";

export class PaymentsService {  
    async payments(payload: PaymentDto){
        await sendMessage(payload)
        return 
    }

    async purgePayments() {
        const sql = `
            DELETE FROM PAYMENTS;
            DELETE FROM health_check where id not in (1,2);
        `
        await Database.query(sql)

        return
    }
}