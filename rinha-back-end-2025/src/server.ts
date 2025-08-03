import dotenv from 'dotenv';

import fastify from 'fastify';
import { PaymentDto } from './dto/payment.dto';
import { PaymentsService } from './service/payments.service';
import { SummaryService } from './service/summary.service';

dotenv.config();

const app = fastify({
  logger: false,
  disableRequestLogging: true,
  ignoreTrailingSlash: true
})

app.addContentTypeParser('application/json', {parseAs: 'string'}, (req, body, done) => {
  try {
    const json = body ? JSON.parse(body.toString()) : {}
    done(null,json)
  } catch (error: any) {
    done(error, undefined)
  }
})

app.post('/payments', async (req, res) => {
  const payments = new PaymentsService()
  const payload = req.body as PaymentDto
  await payments.payments(payload)
  res.status(200).send()
})

app.get('/payments-summary', async(req, res) => {
  const payments = new SummaryService()
  const payload = req.query as any
  const summary = await payments.payments({
    from: payload.from,
    to: payload.to
  })
  res.status(200).send(summary)
})

app.post('/purge-payments', async(req, res) => {
  const payments = new PaymentsService()
  await payments.purgePayments()
  res.status(200).send()
})

app.get('/', (req, res) => {
  res.status(200).send()
});

const start = async () => {
  const port = Number(process.env.PORT) ?? 3000
  await app.listen({port, host: '0.0.0.0'})
}

if (require.main?.filename === module.filename){
  start()
}

