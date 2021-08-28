import "../styles/globals.css";
import { buildClient } from "../api/build-client";
import { CurrentUser } from "../helpers/interface/CurrentUser";
import { PageProps } from "../helpers/interface/PageProps";
import {Header} from "../components/Headers"
import type { AppProps, AppContext } from "next/app";
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

export default MyApp;
