import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup with a cookie", async () => {
  const cookie = await global.getCookie()
  const response = await request(app)
    .get("/api/users/currentuser")
    .set('Cookie',cookie)
    .expect(200)
    expect(response.body.currentUser.email).toEqual('ad@gmail.com')
});

it("returns null on anonymous request", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .expect(200) 
    expect(response.body.currentUser).toBeNull()
});