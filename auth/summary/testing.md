### 1st make a setup.ts file in ./test `. refers to root structure of service)` and paste 
```typescript
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest"

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// before each test it is advisable to clear all database collections for fully isolated tests
beforeEach(async () => {
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
  function getCookie():Promise<string[]>
}


global.getCookie=async ()=>{
  const res = await request(app)
  .post("/api/users/signup")
  .send({
    email: "ad@gmail.com",
    password: "string",
  })
  .expect(201);
  return res.get('Set-Cookie')
}
```
### 2nd add these lines to `package.json`
```JSON
 "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "setupFilesAfterEnv": [
      "./src/test/setup.ts"
    ]
  }

```

### 3. To test something make a folder `__test__`  in dir of project files and make files like *.test.ts

### 4. Semantics for writing tests basically async functions inside `it` fn with a comment do whatever u want and expect stuff

```typescript
import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup with a cookie", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(200);
  return expect(response.get('Set-Cookie')).toBeDefined()
});

it("returns a 400 on invalid email", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "adgmail",
      password: "string",
    })
    .expect(400)
    .expect({
      errors: [
        {
          message: "Email must be valid",
          field: "email",
        },
      ],
    });
});

it("returns a 400 on invalid password", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "ad@gmail.com",
      password: "",
    })
    .expect({
      errors: [
        {
          message: "You must supply a password",
          field: "password",
        },
      ],
    });
});

it("fails when a email that does not exist is supplied", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(401)
    .expect({
      errors: [
        {
          message: "Not authorized",
        },
      ],
    });
});

it("fails when an incorrect password is supplied",async()=>{
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "ad@gmail.com",
      password: "strin",
    })
    .expect(401)
    .expect({
      errors: [
        {
          message: "Not authorized",
        },
      ],
    });
  
})

```