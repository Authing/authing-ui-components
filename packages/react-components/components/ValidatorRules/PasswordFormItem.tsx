import { Form } from 'antd'
import React from 'react'
import { PasswordFormItemProps } from '.'
import { getPasswordValidate } from '../_utils'
import { usePublicConfig } from '../_utils/context'
export interface ExPasswordFormItemProps extends PasswordFormItemProps {
  fieldRequiredRuleMessage?: string
}
export const PasswordFormItem: React.FC<ExPasswordFormItemProps> = (props) => {
  const { rules, fieldRequiredRuleMessage, ...fromItemProos } = props

  const publicConfig = usePublicConfig()

  return publicConfig ? (
    <Form.Item
      validateTrigger={['onChange', 'onBlur']}
      validateFirst={true}
      name="password"
      rules={[
        ...getPasswordValidate(
          publicConfig.passwordStrength,
          publicConfig.customPasswordStrength,
          fieldRequiredRuleMessage
        ),
        ...(rules ?? []),
      ]}
      {...fromItemProos}
    />
  ) : (
    <Form.Item {...props} />
  )
}
