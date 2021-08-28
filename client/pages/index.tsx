import { NextPage } from "next";
import { CurrentUser } from "../helpers/interface/CurrentUser";
import { buildClient } from "../api/build-client";
import { PageProps } from "../helpers/interface/PageProps";

type HomeProps = PageProps<CurrentUser>;

const Home: NextPage<HomeProps> = (props) => {
  return (
    <div className="px-3">
      {props.currentUser ? (
        <h1>You are signed in</h1>
      ) : (
        <h1>You are not signed in</h1>
      )}
    </div>
  );
};

Home.getInitialProps = async (ctx) => {
  const client = buildClient(ctx);
  const { data } = await client.get<CurrentUser | null>(
    "/api/users/currentuser"
  );
  return { currentUser: data!.currentUser };
};

export default Home;
