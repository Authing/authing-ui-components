import { Form } from 'antd'
import { FormItemProps } from 'antd/lib/form'
import React from 'react'
import { getPasswordValidate, PasswordStrength } from '../_utils'

export interface PasswordFormItemProps extends FormItemProps {
  passwordStrength: PasswordStrength
  customPasswordStrength: any
}

export const PasswordFormItem: React.FC<PasswordFormItemProps> = (props) => {
  const {
    passwordStrength,
    customPasswordStrength,
    rules,
    ...fromItemProos
  } = props

  return (
    <Form.Item
      validateFirst={true}
      name="password"
      rules={[
        ...getPasswordValidate(passwordStrength, customPasswordStrength),
        ...(rules ?? []),
      ]}
      {...fromItemProos}
    />
  )
}
