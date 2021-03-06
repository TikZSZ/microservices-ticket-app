import { natsWrapper } from "../nats-wrapper";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const port = 3000;

const start = async ()=>{

  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID must be defined')
  }

  if(!process.env.NATS_URL){
    throw new Error('NATS_URL must be defined')
  }

  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_CLIENT_ID must be defined')
  }

  if(!process.env.REDIS_HOST){
    throw new Error('REDIS_HOST must be defined')
  }

  if(!process.env.REDIS_PORT){
    throw new Error('REDIS_PORT must be defined')
  }
  try{
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID,process.env.NATS_CLIENT_ID,process.env.NATS_URL)
    natsWrapper.client.on('close',()=>{
      console.log('Closing connection to nats');
      process.exit()
    })
    process.on('SIGTERM',()=>{
      natsWrapper.client.close()
    })
    process.on('SIGINT',()=>{
      natsWrapper.client.close()
    })
    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()
  }
  catch(err){
    console.error(err)
  }
}



start()
