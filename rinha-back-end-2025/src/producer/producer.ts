import amqplib from 'amqplib';
import { PaymentDto } from '../dto/payment.dto';

export async function sendMessage(payment: PaymentDto) {
    console.log("entrou no sendMessage")
    const conn = await amqplib.connect('amqp://rabbitmq')
    const channel = await conn.createChannel();

    const QUEUE = 'payments'
    await channel.assertQueue(QUEUE, {durable: true})

    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payment)), { persistent: true})

    console.log("Pagamento adicionado na fila")
    await channel.close();
    await conn.close();
}