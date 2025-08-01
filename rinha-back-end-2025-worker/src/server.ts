// worker.ts
import amqplib from 'amqplib';
import { ProcessService } from './service/process.service';

const QUEUE = 'payments';
const CONCURRENCY = 50;


async function connectWithRetry(retries = 5, delay = 3500){
  while (retries > 0) {
    try {
      const conn = await amqplib.connect('amqp://rabbitmq');
      console.log("✅ Conectado ao RabbitMQ");
      return conn;
    } catch (err) {
      console.error("❌ Falha ao conectar. Tentando novamente em 3s...");
      retries--;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("❌ Não foi possível conectar ao RabbitMQ após múltiplas tentativas.");
}

async function consume() {
  const conn = await connectWithRetry();
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  const processService = new ProcessService()

  channel.prefetch(CONCURRENCY);

  channel.consume(QUEUE, async (payment) => {
    if (payment) {
      const content = JSON.parse(payment.content.toString());

      try {

        await processService.payments(content)
        console.log('Processado:', content);
        channel.ack(payment); // Confirma processamento
      } catch (error:any) {
        console.error('Erro ao processar:', error.message);
      }
    }
  }, { noAck: false });
}

consume().catch((err) => {
  console.error('Erro ao consumir fila:', err);
  process.exit(1);
});

