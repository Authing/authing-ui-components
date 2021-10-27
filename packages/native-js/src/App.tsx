import React, { useEffect } from "react";
import "./App.css";
import { AuthingGuard, GuardMode, Guard } from "./components";

function App() {
  useEffect(() => {
    const guard = new Guard("610271b10cd9106606c73d57");

    // @ts-ignore
    window.guard = guard;

    // guard.show()

    guard.on("load", (e: any) => {
      console.log("加载啊", e);
    });

    guard.on("close", () => {
      console.log("关闭");
      setTimeout(() => {
        guard.show();
      }, 2000);
    });
  }, []);

  return <div className="App"></div>;
}

export default App;
