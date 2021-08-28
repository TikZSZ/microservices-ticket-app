export const natsWrapper = {
client:{
  publish:jest
  .fn()
  .mockImplementation((subject:string,data:string,fn:(err:any)=>void):void=>{
  fn(null)
  }),
}, 
}


