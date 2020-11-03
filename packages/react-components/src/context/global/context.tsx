import React, { useReducer } from "react";
import { createBaseContext, IBaseContext, BaseContextComponent } from "../base";
import { reducer, IState } from "./reducer";

// 页面上下文，除了状态外还有公开的方法
export interface IGlobalContext extends IBaseContext<IState> {
  dispatch: Function;
  getValue: (key: string) => any;
  setValue: (key: string, value: any) => void;
}

// 实例化上下文，这里避免了为空检查
const [Context, useBaseContext] = createBaseContext<IGlobalContext>();

export function useGlobalContext(): IGlobalContext {
  const globalContext = useBaseContext();
  // TODO: custom some
  return globalContext;
}

export function GlobalContext({ children = null, value }: BaseContextComponent<Record<string, any>>) {
  const [state, dispatch] = useReducer(reducer, value);
  const getValue = (key: string) => state[key];
  const setValue = (key: string, value: any) => {
    dispatch({ type: "SET_VALUE", key, value });
  };

  let ctx: IGlobalContext = {
    state,
    dispatch,
    getValue,
    setValue
  };

  return <Context.Provider value={ctx}>{children}</Context.Provider>;
}
