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
  UserConfig,
  GuardEventsHandler,
} from '@authing/native-js-ui-components';

export * from './lib/AuthingGuard/authing-guard.service';
export * from './lib/AuthingGuard/authing-guard.component';
export * from './lib/AuthingGuard/authing-guard.module';

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
};

export {
  GuardMode,
  GuardScenes,
  LoginMethods,
  getAuthClient,
  initAuthClient,
  RegisterMethods,
};
