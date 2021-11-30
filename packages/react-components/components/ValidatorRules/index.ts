import { FormInstance, FormItemProps } from 'antd/lib/form'
import FormItem from 'antd/lib/form/FormItem'
import { PasswordFormItem } from './PasswordFormItem'
import { EmailFormItem, PhoneFormItem } from './ValidatorFormItem'

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

export type { PasswordFormItemProps } from './PasswordFormItem'

type InternalFormItemType = typeof FormItem

interface FormItemInterface extends InternalFormItemType {
  Password: typeof PasswordFormItem
  Email: typeof EmailFormItem
  Phone: typeof PhoneFormItem
}

const CustomFormItem = FormItem as FormItemInterface

CustomFormItem.Password = PasswordFormItem
CustomFormItem.Email = EmailFormItem
CustomFormItem.Phone = PhoneFormItem

export default CustomFormItem
