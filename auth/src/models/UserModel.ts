import mongoose from "mongoose";
import { PasswordManager } from "../services/PasswordManager";

interface UserAttrs{
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document{
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc>{
  build(attrs:UserAttrs):UserDoc
}

interface ReturnedUserDoc{
  id?:string
  email?: string;
  password?: string;
  _id?:string;
  __v?:string;
}

const UserSchema = new mongoose.Schema<UserDoc,UserModel>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
},{
  toJSON:{
    transform:(doc:UserDoc,ret:ReturnedUserDoc)=>{
      ret.id = ret._id
      delete ret._id
      delete ret.password
      delete ret.__v
    }
  }
});

UserSchema.pre('save',async function(done){
  if(this.isModified('password')){
    const hashed = await PasswordManager.toHash(this.get('password'))
    this.set('password',hashed)
  }
  done()
})

UserSchema.statics.build=(attrs:UserAttrs)=>{
  return new UserModel(attrs)
}
export const UserModel = mongoose.model<UserDoc,UserModel>("User", UserSchema);

