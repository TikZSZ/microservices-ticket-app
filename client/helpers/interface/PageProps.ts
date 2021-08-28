import { UserPayload } from "./UserPayload";

export interface PageProps<T=any>{
  currentUser:UserPayload|null,
  componentProps?:T
} 
 
