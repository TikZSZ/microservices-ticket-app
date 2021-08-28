import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
let mongo: MongoMemoryServer;

jest.mock('../nats-wrapper')

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  mongo = await MongoMemoryServer.create();
  
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.mock('../nats-wrapper')
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

declare global {
  function getCookie(id?:string):string[]
}

global.getCookie= (id?)=>{
  const payload = {
    id:id || "5",
    email:"ad@gmail.com"
  }
  const jsonToken = jwt.sign(payload,process.env.JWT_KEY!)
  const sessionJSON = {jwt:jsonToken}
  const base64String = Buffer.from(JSON.stringify(sessionJSON)).toString("base64")
  return [`express:sess=${base64String}`]
}

