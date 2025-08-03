import { PaymentDto } from './dto/payment.dto';
import redis from './redis/redisClient';
import { getHealthCheck } from './service/healthCheck.service';
import { ProcessService } from './service/process.service';

const QUEUE = 'payments';
const CONCURRENCY = 8;

async function processOneWorker(id: number){
  const processService = new ProcessService()
  while (true) {
    try{

      const payment = await redis.brpop(QUEUE, 0)

      if (payment) {
        const [ _, element ] = payment
        if (!element) {
          // console.warn(`não processou esse: PAYMENT WITH WORKER [${id}]: `, payment)
          return 
        }
        const paymentParsed = JSON.parse(element) as PaymentDto

        await processService.payments(paymentParsed)
      }
    }catch(error) {
      console.error(`ERRO worker id = ${id}: `, error)
    }
  }
}

async function startWorkers() {
  
  let workers = []
  for (let i = 1; i <= CONCURRENCY; i++) {
    workers.push(processOneWorker(i))
  }
  
  await Promise.all(workers)

  const consultaHealth = Number(process.env.HEALTH_CHECK)
  
  if (consultaHealth === 1){

    setInterval(async () => {
      try {
        await getHealthCheck();      
      } catch (err) {
        console.error('[Erro no getHealthCheck()]', err);
      }
    }, 4000); //1s
  }

}

startWorkers().catch((err) => {
  console.error("Erro ao processar fila.")
  process.exit(1);
});
