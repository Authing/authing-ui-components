import { User } from 'authing-js-sdk'
import { LoginMethods } from './GuardConfig'

export interface BaseFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onSuccess: (user: User) => void
  onFail: (error: any) => void
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
