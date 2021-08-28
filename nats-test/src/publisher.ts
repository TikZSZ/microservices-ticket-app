import nats, { Stan, Message } from "node-nats-streaming";
import { Publisher } from "./events/base-publisher";
import { Subjects } from "./events/subjects";
import { TicketCreatedEvent } from "./events/ticket-created-event";
console.clear();
const stan = nats.connect("ticketing", "abc", {
  url: "http://192.168.39.205:30001",
});

stan.on("connect", async () => {
  const data = {
    id: "1",
    title: "Aditya",
    price: 50,
  };

  const publish = new Publish(stan);
  await publish.publish(data);
});

class Publish extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
