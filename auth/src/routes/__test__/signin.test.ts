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