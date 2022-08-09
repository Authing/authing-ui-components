// export * from "./Guard";
import { Guard } from "./Guard";
import { AuthingGuard } from "./AuthingGuard";

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
  GuardModuleType,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  GuardEventsCamelToKebabMap,
  GuardEvents,
  GuardEventsKebabToCamelType,
  GuardEventsCamelToKebabMapping,
  GuardConfig,
  GuardLocalConfig,
} from "@authing/react-ui-components";

export {
  Guard,
  AuthingGuard,
  GuardMode,
  GuardScenes,
  LoginMethods,
  getAuthClient,
  initAuthClient,
  RegisterMethods,
  GuardEventsCamelToKebabMap,
  GuardEventsCamelToKebabMapping,
};
export type {
  GuardConfig,
  GuardLocalConfig,
  GuardEvents,
  User,
  UserConfig,
  CommonMessage,
  GuardModuleType,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  GuardEventsKebabToCamelType,
};
