import Form, { FormItemProps } from 'antd/lib/form'
import React from 'react'
import { useTranslation } from 'react-i18next'
import './style.less'
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
    ruleKeyword = t('common.captchaCode'),
    ...formItemProps
  } = props
  return (
    <Form.Item
      validateTrigger={['onBlur', 'onChange']}
      name="mfaCode"
      className="g2-mfa-totp-verify-input"
      rules={[
        {
          type: 'array',
          validateTrigger: ['onBlur'],
          message: t('common.isMissing', {
            name: ruleKeyword,
          }),
          required: true,
        },
        {
          type: 'array',
          validateTrigger: ['onChange'],
          message: t('common.fullCaptchaCode', {
            name: ruleKeyword,
          }),
          min: codeLength,
        },
      ]}
      {...formItemProps}
    />
  )
}
