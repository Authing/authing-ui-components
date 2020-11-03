import { IBaseAction } from "../base";

export type IState = Record<string, any>

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
