import { User } from 'authing-js-sdk'
import { LoginMethods } from './GuardConfig'
import { ResetPwdMethods } from '@/components/AuthingGuard/types/GuardConfig'

export interface BaseFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onSuccess?: (user: User) => void
  onFail?: (error: any) => void
}

export interface PasswordLoginFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface PhoneCodeLoginFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface LdapLoginFormProps extends BaseFormProps {
  onValidateFail?: (error: any) => void
}

export interface QrLoginFormProps extends BaseFormProps {
  type: LoginMethods.AppQr | LoginMethods.WxMinQr
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

export interface MfaResetForm extends BaseFormProps {
  goVerify: () => void
}
