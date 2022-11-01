import { getGuardHttp, useGuardHttp } from '../_utils/guardHttp'
export const enum IdentityBindingBusinessAction {
  PhoneCode = 'phone-code',
  EmailCode = 'emial-code',
  Password = 'password',
}
export interface PhoneCodeParams {
  phone: string
  code: string
  phoneCountryCode?: string
}
export interface EmailCodeParams {
  email: string
  code: string
}
export interface PasswordParams {
  account: string
  password: string
  captchaCode: string
}

export const enum IdentityBindingAction {
  CreateUser = 'create-federation-account',
  BindByPassword = 'bind-identity-by-password',
  BindByPhoneCode = 'bind-identity-by-phone-code',
  BindByEmailCode = 'bind-identity-by-email-code',
}

export const PhoneCode = async (params: PhoneCodeParams) => {
  // const { phone, code, phoneCountryCode } = params

  const { post } = getGuardHttp()

  return await post('/interaction/federation/binding/byPhoneCode', params)
}

export const EmailCode = async (params: EmailCodeParams) => {
  const { email, code } = params

  const { post } = getGuardHttp()

  return await post('/interaction/federation/binding/byEmailCode', {
    email,
    code,
  })
}

export const Password = async (params: PasswordParams) => {
  const { account, password } = params

  const { post } = getGuardHttp()

  return await post('/interaction/federation/binding/byAccount', {
    account,
    password,
  })
}

export const useIdentityBindingBusinessRequest = () => {
  const { authFlow } = useGuardHttp()

  const request = {
    [IdentityBindingBusinessAction.PhoneCode]: (params: PhoneCodeParams) => {
      return authFlow(IdentityBindingAction.BindByPhoneCode, params)
    },
    [IdentityBindingBusinessAction.EmailCode]: (params: EmailCodeParams) => {
      return authFlow(IdentityBindingAction.BindByEmailCode, params)
    },
    [IdentityBindingBusinessAction.Password]: (params: PasswordParams) => {
      return authFlow(IdentityBindingAction.BindByPassword, params)
    },
  }

  return request
}
