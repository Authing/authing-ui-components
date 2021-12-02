import { Form } from 'antd'
import React from 'react'
import { PasswordFormItemProps } from '.'
import { getPasswordValidate } from '../_utils'

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
