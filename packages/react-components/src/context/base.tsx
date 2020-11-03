import React from "react";

// create context with no upfront defaultValue
// without having to do undefined check all the time
export function createBaseContext<C>() {
  const ctx = React.createContext<C | undefined>(undefined);
  function useBaseContext() {
    const ctxConst = React.useContext(ctx);
    if (!ctxConst)
      throw new Error("useBaseContext must be inside a Provider with a value");
    return ctxConst;
  }
  // make TypeScript infer a tuple, not an array of union types
  return [ctx, useBaseContext] as const;
}

export interface IBaseAction<ActionType = string> {
  type: ActionType & string;
  payload?: any;
  [key: string]: string;
}

export interface IBaseContext<S> {
  state: S;
  [k: string]: any;
}

export type BaseContextComponent<Props> = React.PropsWithChildren<Props>;
