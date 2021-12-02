import { Form } from 'antd'
import React from 'react'
import { PasswordFormItemProps } from '.'
import { getPasswordValidate } from '../_utils'
import { usePublicConfig } from '../_utils/context'

export const PasswordFormItem: React.FC<PasswordFormItemProps> = (props) => {
  const { rules, ...fromItemProos } = props

  const publicConfig = usePublicConfig()

  return publicConfig ? (
    <Form.Item
      validateFirst={true}
      name="password"
      rules={[
        ...getPasswordValidate(
          publicConfig.passwordStrength,
          publicConfig.customPasswordStrength
        ),
        ...(rules ?? []),
      ]}
      {...fromItemProos}
    />
  ) : (
    <Form.Item {...props} />
  )
}
