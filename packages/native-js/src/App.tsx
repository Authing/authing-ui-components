import React, { useEffect } from "react";
import "./App.css";
import { AuthingGuard, GuardMode } from "./components";

function App() {
  useEffect(() => {
    const guard = new AuthingGuard(
      "6191cf610f772aa56dc70637",
      {
        target: ".App",
        appHost: "https://core.dev2.authing-inc.co/",
        mode: GuardMode.Modal,
      },
      "6194a41abf23c1d5268b362a"
    );

    // @ts-ignore
    window.guard = guard;

    guard.show();

    guard.on("load", (e: any) => {
      console.log("加载啊", e);
    });

    guard.on("close", () => {
      setTimeout(() => {
        guard.show();
      }, 2000);
    });
  }, []);

  return <div className="App"></div>;
}

export default App;
