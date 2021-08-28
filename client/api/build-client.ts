import axios from "axios";
import { NextPageContext } from "next";

export function buildClient(ctx: NextPageContext) {
  const { req } = ctx;
  if (typeof window === "undefined") {
    // we are on server
    // request should be made to service-name.namespace-name.svc.cluster.local/EndPointName
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req!.headers,
    });
  } else {
    // we are one client
    // request can be made with a base url of ''
    return axios.create({
      baseURL:"/",
    });
  }
}
