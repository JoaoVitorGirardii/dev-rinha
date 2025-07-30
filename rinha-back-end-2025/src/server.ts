import dotenv from 'dotenv';

import express from 'express';
import { PaymentDto } from './dto/payment.dto';
import { PaymentsService } from './service/payments.service';
import { SummaryService } from './service/summary.service';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

console.log("process.env.BASE_URL_FALLBACK: ", process.env.BASE_URL_FALLBACK)

app.use(express.json());

app.post('/payments', async (req, res) => {
  const payments = new PaymentsService()
  const payload = req.body as PaymentDto
  console.log("chegou no payments: ", payload)
  await payments.payments(payload)
  res.sendStatus(200)
})

app.get('/payments-summary', async(req, res) => {
  const payments = new SummaryService()
  const payload = req.query as any
  const summary = await payments.payments({
    from: new Date(payload.from),
    to: new Date(payload.to)
  })
  res.json(summary)
})

app.post('/purge-payments', async(req, res) => {
  const payments = new PaymentsService()
  await payments.purgePayments()
  res.sendStatus(200)
})

app.get('/', (req, res) => {
  res.send('server run');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
