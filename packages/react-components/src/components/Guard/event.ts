import { LoginMethods, RegisterMethods } from 'authing-js-sdk'
import {
  AuthenticationClient,
  CommonMessage,
  PasswordLoginParams,
  LDAPLoginParams,
  ADLoginParams,
  PhoneCodeLoginParams,
  User,
  EmailRegisterParams,
  PhoneRegisterParams,
} from '..'

export interface GuardEvents {
  onLoad?: (authClient: AuthenticationClient) => void
  onLoadError?: (error: CommonMessage) => void
  onBeforeLogin?: (
    loginInfo:
      | PasswordLoginParams
      | LDAPLoginParams
      | ADLoginParams
      | PhoneCodeLoginParams,
    authClient: AuthenticationClient
  ) => boolean | Promise<boolean>
  onLogin?: (user: User, authClient: AuthenticationClient) => void
  onLoginError?: (user: User, authClient: AuthenticationClient) => void
  onBeforeRegister?: (
    registerInfo: EmailRegisterParams | PhoneRegisterParams,
    authClient: AuthenticationClient
  ) => boolean | Promise<boolean>
  onRegister?: (user: User, authClient: AuthenticationClient) => void
  onRegisterError?: (user: User, authClient: AuthenticationClient) => void
  onPwdEmailSend?: (authClient: AuthenticationClient) => void
  onPwdEmailSendError?: (
    error: CommonMessage,
    authClient: AuthenticationClient
  ) => void
  onPwdPhoneSend?: (authClient: AuthenticationClient) => void
  onPwdPhoneSendError?: (
    error: CommonMessage,
    authClient: AuthenticationClient
  ) => void
  onPwdReset?: (authClient: AuthenticationClient) => void
  onPwdResetError?: (
    error: CommonMessage,
    authClient: AuthenticationClient
  ) => void
  onClose?: () => void
  onLoginTabChange?: (activeTab: LoginMethods) => void
  onRegisterTabChange?: (activeTab: RegisterMethods) => void
  onRegisterInfoCompleted?: (
    user: User,
    udfs: {
      definition: any
      value: any
    }[],
    authClient: AuthenticationClient
  ) => void
  onRegisterInfoCompletedError?: (
    error: CommonMessage,
    udfs: {
      definition: any
      value: any
    }[],
    authClient: AuthenticationClient
  ) => void
}

let GuardEventsList: GuardEvents

export const initEvents = (guardEvents: GuardEvents) => {
  GuardEventsList = guardEvents

  return GuardEventsList
}

export const getEvents = () => {
  if (!GuardEventsList) {
    throw new Error('Please initialize Guard events')
  }

  return GuardEventsList
}

export const useEvents = () => getEvents()
