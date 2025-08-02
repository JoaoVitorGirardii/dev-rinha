// worker.ts

import { PaymentDto } from './dto/payment.dto';
import redis from './redis/redisClient';
import { getHealthCheck, getHealthCheckDefault } from './service/healthCheck.service';
import { ProcessService } from './service/process.service';

const QUEUE = 'payments';
const CONCURRENCY = 45;



async function processOneWorker(id: number){
  const processService = new ProcessService()
  while (true) {
    try{
      const payment = await redis.brPop(QUEUE, 0)
      if (payment) {
        // console.log(`PAYMENT WITH WORKER [${id}]: `, payment)
        const { element } = payment
        if (!element) {
          console.warn(`não processou esse: PAYMENT WITH WORKER [${id}]: `, payment)
          return 
        }
        const paymentParsed = JSON.parse(element) as PaymentDto
        await processService.payments(paymentParsed)
        //console.log('Processado:', paymentParsed);
      }
    }catch(error) {
      console.error(`ERRO worker id = ${id}: `, error)
    }
  }
}

async function startWorkers() {
  
  for (let i = 1; i <= CONCURRENCY; i++) {
    processOneWorker(i);
  }
  
  const consultaHealth = Number(process.env.HEALTH_CHECK)
  
  if (consultaHealth === 1){
    getHealthCheckDefault()
    setInterval(async () => {
      try {
        getHealthCheck();      
      } catch (err) {
        console.error('[Erro no getHealthCheck()]', err);
      }
    }, 5005);
  }
}

startWorkers().catch((err) => {
  console.error("Erro ao processar fila.")
  process.exit(1);
});

