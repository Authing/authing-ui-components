import { FormInstance, FormItemProps } from 'antd/lib/form'

export interface ValidatorFormItemProps extends FormItemProps {
  userPoolId: string
  form: FormInstance
}

export interface ICheckProps {
  check: () => void
}

export { EmailFormItem } from './EmailFormItem'
export { PhoneFormItem } from './PhoneFormItem'
