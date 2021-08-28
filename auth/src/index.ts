import mongoose from "mongoose";
import {app} from "./app"

const port = 3000;

const start = async ()=>{

  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY must be defined')
  }

  if(!process.env.MONGO_URI){
    throw new Error('Mongo uri must be defined')
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
}



start()