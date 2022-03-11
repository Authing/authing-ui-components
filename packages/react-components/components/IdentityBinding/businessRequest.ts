import { useGuardIsAuthFlow } from '../_utils/context'
export enum IdentityBindingBusinessAction {
  PhoneCode = 'phone-code',
  EmailCode = 'emial-code',
  Password = 'password',
}

export const PhoneCode

export const useIdentityBindingBusinessRequest = () => {
  const isFlow = useGuardIsAuthFlow()

  const request = {
    [IdentityBindingBusinessAction.PhoneCode]: (
      content: VerifyEmailContent
    ) => {
      if (isFlow) {
        return authFlow(MfaBusinessAction.VerifyEmail, content)
      }

      return VerifyEmail(content)
    },
    [MfaBusinessAction.VerifySms]: (content: VerifySmsContent) => {
      if (isFlow) {
        return authFlow(MfaBusinessAction.VerifySms, content)
      }

      return VerifySms(content)
    },
    [MfaBusinessAction.VerifyTotp]: (content: VerifyTotpContent) => {
      if (isFlow) {
        return authFlow(MfaBusinessAction.VerifyTotp, content)
      }

      return VerifyTotp(content)
    },
    [MfaBusinessAction.VerifyFace]: (content: VerifyFaceContent) => {
      if (isFlow) {
        return authFlow(MfaBusinessAction.VerifyFace, content)
      }

      return VerifyFace(content)
    },
  }

  return request
}
