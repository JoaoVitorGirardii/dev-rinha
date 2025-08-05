import { Database } from "../database/database";

export async function purgePayments() {
    const sql = `DELETE FROM PAYMENTS;`
    await Database.query(sql)

    return
}
