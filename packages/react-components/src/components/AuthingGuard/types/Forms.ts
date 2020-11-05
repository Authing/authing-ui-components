import { User } from 'authing-js-sdk'

export interface BaseFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onSuccess: (user: User) => void
  onValidateFail: (error: any) => void
  onFail: (error: any) => void
}

export interface PasswordLoginFormProps extends BaseFormProps {}

export interface PhoneCodeLoginFormProps extends BaseFormProps {}

export interface LdapLoginFormProps extends BaseFormProps {}
