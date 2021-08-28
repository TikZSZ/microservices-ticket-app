import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup with a cookie", async () => {
  const res1 = await request(app)
    .post("/api/users/signup")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(201);
  const res2 = await request(app)
    .post("/api/users/signout")
    .send({
      email: "ad@gmail.com",
      password: "string",
    })
    .expect(200);
  return expect(res2.get('Set-Cookie')).toBeNull
});