import { MongoMemoryServer,MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import {natsWrapper} from "../nats-wrapper"
let mongo: MongoMemoryServer;
let replset:MongoMemoryReplSet;
jest.mock('../nats-wrapper')

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  // mongo = await MongoMemoryServer.create({instance:{storageEngine:"wiredTiger"}});
  // const mongoUri = mongo.getUri();
  replset = await MongoMemoryReplSet.create({ replSet: { count:1,storageEngine:'wiredTiger' } }); // This will create an ReplSet with 4 members

  const uri = replset.getUri();
  await mongoose.connect(`${uri}retryWrites=false`, {
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
  // await mongo.stop();
  await replset.stop()
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

