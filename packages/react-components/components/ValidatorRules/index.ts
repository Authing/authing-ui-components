import { FormInstance, FormItemProps } from 'antd/lib/form'

export interface ValidatorFormItemProps extends FormItemProps {
  userPoolId?: string
  form?: FormInstance
  checkRepeat?: boolean
}

export interface ValidatorFormItemMetaProps extends ValidatorFormItemProps {
  userPoolId?: string
  form?: FormInstance
  checkRepeat?: boolean
  method: 'email' | 'phone'
}

export interface ICheckProps {
  check: (values: any) => void
}

export { EmailFormItem, PhoneFormItem } from './ValidatorFormItem'
