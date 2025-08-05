import dotenv from 'dotenv';

import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { queuePayments } from './producer/producer';
import { purgePayments } from './service/payments.service';
import { paymentsDbSumary } from './service/summary.service';

dotenv.config();

const app = Fastify({
  logger: false,
  disableRequestLogging: true,
  ignoreTrailingSlash: true,
  trustProxy: true,
  caseSensitive: false,
  useSemicolonDelimiter: false
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.post('/payments', async (req, res) => {
  await queuePayments(req.body)
  res.status(200).send()
})

app.get('/payments-summary', async(req, res) => {
  const payload = req.query as any
  const summary = await paymentsDbSumary({
    from: payload.from,
    to: payload.to
  })
  res.status(200).send(summary)
})

app.post('/purge-payments', async(req, res) => {
  await purgePayments()
  res.status(200).send()
})

const start = async () => {
  const port = Number(process.env.PORT) ?? 3000
  await app.listen({port, host: '0.0.0.0'})
}

if (require.main?.filename === module.filename){
  start()
}

