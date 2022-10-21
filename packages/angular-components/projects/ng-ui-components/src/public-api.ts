/*
 * Public API Surface of authing-guard
 */

import {
  User,
  GuardMode,
  GuardModuleType,
  LoginMethods,
  CommonMessage,
  RegisterMethods,
  AuthenticationClient,
} from '@authing/native-js-ui-components';

export * from './lib/Guard/guard.service';
export * from './lib/Guard/guard.component';
export * from './lib/Guard/guard.module';

export type { CommonMessage, AuthenticationClient, User };

export { GuardMode, GuardModuleType, LoginMethods, RegisterMethods };
