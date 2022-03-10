// export * from "./Guard";
import { Guard } from "./Guard";
import { AuthingGuard } from "./AuthingGuard";
import { GuardConfig, GuardLocalConfig } from "@authing/react-ui-components";
import {
  User,
  GuardMode,
  UserConfig,
  GuardScenes,
  LoginMethods,
  getAuthClient,
  CommonMessage,
  initAuthClient,
  RegisterMethods,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  GuardEventsCamelToKebabMap,
  AuthenticationClientOptions,
} from "@authing/react-ui-components";

export type {
  User,
  UserConfig,
  CommonMessage,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  AuthenticationClientOptions,
};

export {
  GuardMode,
  GuardScenes,
  LoginMethods,
  getAuthClient,
  initAuthClient,
  RegisterMethods,
  GuardEventsCamelToKebabMap,
};
export { Guard, AuthingGuard };
export type { GuardConfig, GuardLocalConfig };
