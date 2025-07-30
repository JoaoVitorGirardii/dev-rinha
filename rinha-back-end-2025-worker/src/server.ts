// worker.ts
import amqplib from 'amqplib';

const QUEUE = 'payments';
const CONCURRENCY = 100;


async function connectWithRetry(retries = 5, delay = 3000){
  while (retries > 0) {
    try {
      console.log(`Tentando conectar ao RabbitMQ... (${6 - retries}/5)`);
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

  channel.prefetch(CONCURRENCY);

  channel.consume(QUEUE, async (payment) => {
    if (payment) {
      const content = JSON.parse(payment.content.toString());

      try {
        setTimeout(() => {
          console.log('Processado:', content);
          channel.ack(payment); // Confirma que a mensagem foi processada
        }, 1500); 
      } catch (error) {
        console.error('Erro ao processar:', error);
      }
    }
  }, { noAck: false });
}

consume().catch((err) => {
  console.error('Erro ao consumir fila:', err);
  process.exit(1);
});

