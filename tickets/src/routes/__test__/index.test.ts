import request from "supertest";
import { app } from "../../app";


async function createTicket(payload:any){
  return await request(app)
  .post("/api/tickets")
  .set('Cookie',getCookie())
  .send(payload)
  .expect(201)
}

it('returns all tickets that have been created till now',async ()=>{
  const payload1= {
    title:"string",
    price:10
  }

  const payload2 = {
    title:"string2",
    price:20
  }

  const res1Body = (await createTicket(payload1)).body
  const res2Body = (await createTicket(payload2)).body

  const res = await request(app)
  .get("/api/tickets")
  .expect(200)
  expect(res.body).toEqual([res1Body,res2Body])
  
}) 
