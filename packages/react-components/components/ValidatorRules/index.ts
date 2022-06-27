import { FormInstance, FormItemProps } from 'antd/lib/form'
import FormItem from 'antd/lib/form/FormItem'
import { PasswordFormItem } from './PasswordFormItem'
import {
  EmailFormItem,
  PhoneFormItem,
  UserNameFormItem,
} from './ValidatorFormItem'

export interface ValidatorFormItemProps extends FormItemProps {
  form?: FormInstance
  checkRepeat?: boolean
  checkExist?: boolean
  areaCode?: string //国际化区号
  isCheckI18nSms?: boolean // 是否开启国际化手机号校验
}

export interface ValidatorFormItemMetaProps extends ValidatorFormItemProps {
  method: 'email' | 'phone' | 'username'
}

export interface PasswordFormItemProps extends FormItemProps {}

export interface ICheckProps {
  check: (values: any) => void
}

type InternalFormItemType = typeof FormItem

interface FormItemInterface extends InternalFormItemType {
  Password: typeof PasswordFormItem
  Email: typeof EmailFormItem
  Phone: typeof PhoneFormItem
  UserName: typeof UserNameFormItem
}

const CustomFormItem = FormItem as FormItemInterface

CustomFormItem.Password = PasswordFormItem
CustomFormItem.Email = EmailFormItem
CustomFormItem.Phone = PhoneFormItem
CustomFormItem.UserName = UserNameFormItem
export default CustomFormItem
