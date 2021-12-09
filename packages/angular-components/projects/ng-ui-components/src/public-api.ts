/*
 * Public API Surface of authing-guard
 */

import {
  User,
  GuardMode,
  GuardScenes,
  LoginMethods,
  getAuthClient,
  CommonMessage,
  initAuthClient,
  RegisterMethods,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  AuthenticationClientOptions,
  UserConfig,
  GuardEventsHandler,
} from '@authing/native-js-ui-components';

export * from './lib/Guard/guard.service';
export * from './lib/Guard/guard.component';
export * from './lib/Guard/guard.module';

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
};
