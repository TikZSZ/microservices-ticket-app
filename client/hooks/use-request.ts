import { useState } from "react";
import axios from "axios"
import { CommonError } from "../helpers/interface/CommonError";

type Method = 'get'|"post"|"put"|"patch"|"delete"

export function useRequest<ResponseBody,RequestBody = {}>(useRequestParams:{url:string,method:Method,body?:RequestBody,onSuccess?:(data:ResponseBody)=>void}){
  const {url,method,body,onSuccess} = useRequestParams
  const [errors,setErrors] = useState<CommonError|null>(null)
  const doRequest = async () =>{
    try{
      setErrors(null);
      const response = await axios[method]<ResponseBody>(url,body);
      if(onSuccess){
        onSuccess(response.data)
      }
      return response.data
    }catch(err:any){
      const errorResponse:CommonError = err.response.data;
      setErrors(errorResponse);
    }
  }
  return {doRequest,errors}
}
