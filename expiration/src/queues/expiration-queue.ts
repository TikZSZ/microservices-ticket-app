import Queue from 'bull'
import { natsWrapper } from '../../nats-wrapper'
import { ExpirationCompletePublisher } from '../events/publisher/expiration-complete-publisher'

interface ExpirationQueuePayload{
  orderId: string,
}

export const expirationQueue = new Queue<ExpirationQueuePayload>('order:expiration',{
  redis:{
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!)
  }
})

expirationQueue.process(async (job)=>{
  console.log('I want to publish an expiration:complete event for orderId', job.data.orderId)
  await new ExpirationCompletePublisher(natsWrapper.client).publish({orderId:job.data.orderId})
})

