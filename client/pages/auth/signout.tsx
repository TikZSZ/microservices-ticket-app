import { useEffect } from "react";
import { useRequest } from "../../hooks/use-request";
import Router from "next/router";

const SingOut = () => {
  const { doRequest } = useRequest<any>({
    url: "/api/users/signout",
    method: "post",
    onSuccess: (data) => {
      Router.push("/");
    },
  });
  useEffect(
    () => {
    (async () => {
      await doRequest();
    })();
    }, 
    []
  );

  return (
    <div>
      <h2>Signing you out...</h2>
    </div>
  );
};

export default SingOut;
