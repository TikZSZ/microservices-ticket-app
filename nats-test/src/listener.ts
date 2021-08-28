import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";
console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://192.168.39.205:30001",
});

stan.on('close',()=>{
  console.log('Closing connection to nats');
  process.exit()
})


stan.on("connect", () => {
  console.log("Listener Connected to node nats streaming");
  //const listen = new TicketCreatedListener(stan)
  const options = stan.subscriptionOptions()
  .setDeliverAllAvailable()
  .setManualAckMode(true)
  const sub = stan.subscribe('ticket:updated','ticket',options)
  sub.on('message',(msg:Message)=>{
    const data:string = msg.getData() as string
    console.log(JSON.parse(data),msg.getSequence())
    msg.ack()
  })
});


process.on('SIGTERM',()=>{
  stan.close()
})

process.on('SIGINT',()=>{
  stan.close()
})



