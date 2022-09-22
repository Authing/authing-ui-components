import { Guard } from "@authing/react-ui-components";
import React from "react";
import ReactDOM from "react-dom";

import "@authing/react-ui-components/lib/index.min.css";

import { AuthenticationClient } from "authing-js-sdk";

const authenticationClient = new AuthenticationClient({
  appId: "",
  // 自建应用的【认证地址】
  // 如果是开启了单点登录，则应填写单点登录的【应用面板地址】
  appHost: "",
});

const App = () => {
  const appId = "";

  const config = {
    host: "",
    isSSO: true,
  };

  const onLogin = (userInfo: any) => {
    console.log("userInfo: ", userInfo);
  };

  const logout = () => authenticationClient.logout();

  return (
    <>
      <button onClick={logout}>logout</button>
      <Guard appId={appId} config={config} onLogin={onLogin} />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
