import Form, { FormItemProps } from 'antd/lib/form'
import React from 'react'
import { useTranslation } from 'react-i18next'

export interface VerifyCodeFormItemProps extends FormItemProps {
  codeLength: number
  ruleKeyword?: string
}

export const VerifyCodeFormItem: React.FC<VerifyCodeFormItemProps> = (
  props
) => {
  const { t } = useTranslation()
  const {
    codeLength,
    ruleKeyword = t('common.totpCode'),
    ...formItemProps
  } = props
  return (
    <Form.Item
      name="mfaCode"
      className="g2-mfa-totp-verify-input"
      // validateTrigger={'onBlur'}
      rules={[
        {
          validator(_, value: string[]) {
            if ((value ?? []).join('').length !== codeLength) {
              return Promise.reject(
                t('common.isMissing', {
                  name: ruleKeyword,
                })
              )
            }
            return Promise.resolve()
          },
        },
      ]}
      {...formItemProps}
    />
  )
}
