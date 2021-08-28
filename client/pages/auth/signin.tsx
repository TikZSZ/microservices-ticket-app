import React, { useState } from "react";
import { UserPayload } from "../../helpers/interface/UserPayload";
import { useRequest } from "../../hooks/use-request";
import Router from "next/router"

interface Body {
  email: string;
  password: string;
}

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { doRequest, errors } = useRequest<UserPayload, Body>({
    url: "/api/users/signin",
    method: "post",
    body: { email, password },
    onSuccess:(data)=>{
      Router.push("/")
    }
  });

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await doRequest();
    console.log(response);
  };

  const ProcessError = (field: string) => {
    return errors?.errors.filter((err) => {
      if (!err.field) {
        return field === "email";
      }
      return err.field === field;
    })[0];
  };

  const showError = (field: string) => {
    const error = ProcessError(field);
    if (error) {
      return <p className="alert alert-danger">{error.message}</p>;
    }
    return null;
  };

  return (
    <div className="container my-4 px-3">
      <form onSubmit={onFormSubmit}>
        <h1>Sign In</h1>
        <div className="form-group">
          <label htmlFor="">Email Address</label>
          <input
            type="text"
            className="form-control my-2"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <div>{showError("email")}</div>
        </div>
        <div className="form-group">
          <label htmlFor="">Password</label>
          <input
            type="text"
            className="form-control my-2"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div>{showError("password")}</div>
        </div>
        <button className="btn btn-primary my-2 " type="submit">
          Sign UP
        </button>
      </form>
    </div>
  );
}
