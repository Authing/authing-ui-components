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
  const { codeLength, ruleKeyword, ...formItemProps } = props
  return (
    <Form.Item
      validateTrigger={['onBlur', 'onChange']}
      name="mfaCode"
      className="g2-mfa-totp-verify-input"
      // validateTrigger={'onBlur'}
      rules={[
        {
          validator(_, value: string[]) {
            if ((value ?? []).join('').length !== codeLength) {
              // return Promise.reject()
              return Promise.reject(
                ruleKeyword
                  ? t('common.isMissing', {
                      name: ruleKeyword,
                    })
                  : null
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
