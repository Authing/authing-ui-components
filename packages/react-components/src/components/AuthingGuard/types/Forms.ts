import { User } from 'authing-js-sdk'
import { LoginMethods } from './GuardConfig'
import { ResetPwdMethods } from '../../../components/AuthingGuard/types/GuardConfig'

export interface BaseFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onSuccess?: (user: User) => void
  onFail?: (error: any) => void
}

export interface CompleteUserInfoFormProps extends BaseFormProps {}

export interface PasswordLoginFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface ADLoginFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface PhoneCodeLoginFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface LdapLoginFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface QrLoginFormProps extends BaseFormProps {
  type: LoginMethods.AppQr | LoginMethods.WxMinQr | LoginMethods.WechatMpQrcode
}

export interface EmailRegisterFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface PhoneRegisterFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface ResetPasswordFormProps {
  onSuccess?: () => void
  onFail?: (error: any) => void
}

export interface ResetPasswordStep1Props {
  onSuccess: (resetMethod: ResetPwdMethods, val: string) => void
}

export interface ResetPasswordStep2Props {
  phone: string
  onSuccess: () => void
  onFail?: (error: any) => void
}

export interface ResetPasswordStep3Props {
  email: string
  onSuccess: () => void
  onFail?: (error: any) => void
}

export interface SocialAndIdpLoginProps extends BaseFormProps {}

export interface MfaVerifyForm extends BaseFormProps {
  goReset: () => void
}
export interface SmsMFAVerifyFormProps extends BaseFormProps {
  phone?: string
  mfaToken: string
  sendCodeRef: React.RefObject<HTMLButtonElement>
}

export interface SmsMFAFormProps extends BaseFormProps {}

export interface MFACheckPhoneFormProps {
  mfaToken: string
  onSuccess: (phone: string) => void
}

export interface EmailMFAVerifyFormProps extends BaseFormProps {
  email?: string
  mfaToken: string
  sendCodeRef: React.RefObject<HTMLButtonElement>
}

export interface EmailMFAFormProps extends BaseFormProps {}

export interface MFACheckEmailFormProps {
  mfaToken: string
  onSuccess: (email: string) => void
}

export interface MfaResetForm extends BaseFormProps {
  goVerify: () => void
}
