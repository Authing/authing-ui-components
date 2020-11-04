import { GuardConfig } from "@/components/AuthingGuard/types";
import { AuthenticationClient } from "authing-js-sdk";
import { IBaseAction } from "../base";

export type IState = {
  [index: string]: any
  config: GuardConfig
  authClient: AuthenticationClient
}

const handlers: any = {
  // eslint-disable-next-line
  ["SET_VALUE"]: (state: IState, payloads: any) => {
    return {
      ...state,
      [payloads.key]: payloads.value,
    };
  },
};

export const reducer = (state: IState, { type, ...payloads }: IBaseAction) => {
  const handler = handlers[type];
  if (handler) {
    return handler(state, payloads);
  }
  return state;
};
