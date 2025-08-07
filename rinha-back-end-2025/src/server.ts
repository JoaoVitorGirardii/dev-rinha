import dotenv from 'dotenv';

import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { queuePayments } from './producer/producer';
import { purgePayments } from './service/payments.service';
import { paymentsDbSumary } from './service/summary.service';

dotenv.config();

const app = Fastify({
  logger: false,
  disableRequestLogging: true,
  ignoreTrailingSlash: true,
  trustProxy: true,
  useSemicolonDelimiter: false,
  bodyLimit: 1024 * 2, //2kb
  return503OnClosing: true,
  connectionTimeout: 1500,
  pluginTimeout: 1500,
  maxParamLength: 100
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const paymentSchema = z.object({
  correlationId: z.string(),
  amount: z.string(),
})

const summarySchema = {
      querystring: z.object({
        from: z.optional(z.string()),
        to: z.optional(z.string()),
      }),
  };

app.post('/payments', {schema: paymentSchema}, (req, res) => {
  void queuePayments(req.body)
  res.send()
})

app.get('/payments-summary', { schema: summarySchema }, async(req, res) => {
  const summary = await paymentsDbSumary({
    from: req.query.from,
    to: req.query.to
  })
  res.status(200).send(summary)
})

app.post('/purge-payments', async(req, res) => {
  await purgePayments()
  res.send()
})

const start = async () => {
  const port = Number(process.env.PORT) ?? 3000
  await app.listen({ port, host: '0.0.0.0' })
}

if (require.main?.filename === module.filename){
  start()
}

