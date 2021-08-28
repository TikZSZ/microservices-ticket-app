import nats , {Stan} from "node-nats-streaming"

class NatsWrapper{
  private _client?:Stan

  get client():Stan{
    if(!this._client){
      throw new Error('Cannot access NATS before connecting')
    }
    return this._client
  }

  connect(clusterId:string,clientId:string,url:string){
    this._client =  nats.connect(clusterId,clientId,{url:url,reconnect:true,maxReconnectAttempts:500})
    return new Promise<void>((resolve,reject)=>{
      this.client.on('error',(err)=>{
        reject()
      })  
      this.client.on('connect',()=>{
        console.log('connected to NATS');
        resolve()
      }) 
    }) 
  }
}

export const natsWrapper = new NatsWrapper()


