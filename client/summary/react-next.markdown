### 1st how to implement a basic axios useRequest hooks

```typescript
import { useState } from "react";
import axios from "axios";
import { CommonError } from "../helpers/interface/CommonError";

type Method = "get" | "post" | "put" | "patch" | "delete";

export function useRequest<ResponseBody, RequestBody = {}>(useRequestParams: {
  url: string;
  method: Method;
  body: RequestBody;
  onSuccess?: (data: ResponseBody) => void;
}) {
  const { url, method, body, onSuccess } = useRequestParams;
  const [errors, setErrors] = useState<CommonError | null>(null);
  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method]<ResponseBody>(url, body);
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err: any) {
      const errorResponse: CommonError = err.response.data;
      setErrors(errorResponse);
    }
  };
  return { doRequest, errors };
}
```

### 2nd You can call get initial props on a component and return props directly(this is server side rendering). This function might be called both on server and client.

```typescript
Home.getInitialProps = async (ctx) => {
  const client = buildClient(ctx);
  const { data } = await client.get<CurrentUser | null>(
    "/api/users/currentuser"
  );
  return { currentUser: data!.currentUser };
};
```

### 3rd for page to page router navigation it will be called on client and it can use `just /api/users/* type of url (goes to ingress)` and also send headers directly from client

### for hard refresh etc it runs on server and hence on the clint container. `For it to reach auth-depl we an directly reach auth-srv or redirect to ingress-srv in ingress-nginx namespace`


### 4th to easily make distinct requests regardless of client or server one can export a axios.create object like this which will take care of stuff elegantly
```typescript
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
      baseURL: "/",
    });
  }
}
```

### `when replacing headers with req.headers we essentially make next work as a proxy it contains stuff like cookie and hostname itself` 

### 5th to do a crossName space navigation we follow

```typescript
http://service-name.namespace.svc.cluster.local/`{Enpoint in Ingress}`
```
# Note Host is required in headers to help ingress make distinction between request's subdomain address 
## Note:`service-name is from that namespace`

```Java
k get services -n namespace
find service name
```
#### 6th root app component can have getInitial props but whatever is returned is added to AppProps `to get type checking extend AppProps and provide interface for pageProps` 
#### one can add extra properties and return object resembling similar but it isn't useful as only pageProps is passed to other components and other components cant directly use getInitialProps either also no way to match which component renders hence there will be issue with ts

#### This page props is passed on to all the components, components can have getInitialProps but they have to be manually called inside root app's getInitialProps and then a custom body has to be made that can work with all pages hence use a smart interface

```typescript
import type { AppProps, AppContext } from "next/app";

export interface PageProps<T=any>{
  currentUser:UserPayload|null,
  componentProps?:T
} 
 
// AppProps<PageProps> => this ensures that components know they will be getting props of PageProps Type
interface CustomAppProps extends AppProps<PageProps> {
  pageProps: PageProps;
}

const MyApp = (AppProps: CustomAppProps) => {
  const { Component, pageProps } = AppProps;

  return (
    <div >
      <Header currentUser={pageProps.currentUser} />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
        crossOrigin="anonymous"
      />
      <Component {...pageProps} />
    </div>
  );
};

MyApp.getInitialProps = async (appContext: AppContext): Promise<{ pageProps: PageProps }> => 
{
  const { Component, ctx } = appContext;
  // fetch userAuth Data
  const client = buildClient(ctx);
  const { data } = await client.get<CurrentUser | null>(
    "/api/users/currentuser"
  );
  let ComponentProps = {};
  // fetch Component's data
  if (Component.getInitialProps) {
    const res = await Component.getInitialProps(appContext.ctx);
    ComponentProps = res;
  }
  // combine fetchedData and userAuthData
  return {
    pageProps: {
      currentUser: data!.currentUser,
      componentProps: ComponentProps,
    },
  };
};
```