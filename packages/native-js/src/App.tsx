import React, { useEffect } from "react";
import "./App.css";
import { Guard, GuardEventsCamelToKebabMapping, GuardMode } from "./components";

function App() {
  console.log(GuardEventsCamelToKebabMapping);
  useEffect(() => {
    const guard = new Guard("62cd66dc014378042b55154f", {
      target: ".App",
      mode: GuardMode.Modal,
    });

    // @ts-ignore
    window.guard = guard;
    guard.render("center", () => {
      console.log("mount");
    });
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
