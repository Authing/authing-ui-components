import Form, { FormItemProps } from 'antd/lib/form'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface VerifyCodeFormItemProps extends FormItemProps {
  codeLength: number
  rulesKeyword?: string
}

export const VerifyCodeFormItem: React.FC<VerifyCodeFormItemProps> = (
  props
) => {
  const { codeLength, ...formItemProps } = props
  const { t } = useTranslation()
  return (
    <Form.Item
      name="mfaCode"
      className="g2-mfa-totp-verify-input"
      validateTrigger={false}
      rules={[
        {
          validator(_, value: string[]) {
            if ((value ?? []).join('').length !== codeLength) {
              return Promise.reject(t('login.inputFullMfaCode'))
            }
            return Promise.resolve()
          },
        },
      ]}
      {...formItemProps}
    />
  )
}
