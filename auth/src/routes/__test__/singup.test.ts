import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(201);
});

it("returns a 400 on invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "adgmail",
      password: "string",
    })
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
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "s",
    })
    .expect({
      errors: [
        {
          message: "Password must be between 4 and 20 characters",
          field: "password",
        },
      ],
    });
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(400)
    .expect({
      errors: [
        {
          message: "Email Already In Use",
        },
      ],
    });
});


it('sets a cookie after successful signup',async()=>{
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined() 
})