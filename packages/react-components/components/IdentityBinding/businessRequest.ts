// import { useGuardIsAuthFlow } from '../_utils/context'
import { getGuardHttp } from '../_utils/guardHttp'
export enum IdentityBindingBusinessAction {
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
  //   const isFlow = useGuardIsAuthFlow()

  const request = {
    [IdentityBindingBusinessAction.PhoneCode]: (params: PhoneCodeParams) => {
      //   if (isFlow) {
      //     return authFlow(MfaBusinessAction.VerifyEmail, content)
      //   }
      return PhoneCode(params)
    },
    [IdentityBindingBusinessAction.EmailCode]: (params: EmailCodeParams) => {
      //   if (isFlow) {
      //     return authFlow(MfaBusinessAction.VerifySms, content)
      //   }

      return EmailCode(params)
    },
    [IdentityBindingBusinessAction.Password]: (params: PasswordParams) => {
      //   if (isFlow) {
      //     return authFlow(MfaBusinessAction.VerifyTotp, content)
      //   }

      return Password(params)
    },
  }

  return request
}
