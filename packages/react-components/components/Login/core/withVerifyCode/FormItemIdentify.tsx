import { FormItemProps } from 'antd/lib/form'
import FormItem from 'antd/lib/form/FormItem'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyLoginMethods } from '../../../AuthingGuard/api'
import CustomFormItem from '../../../ValidatorRules'
import { fieldRequiredRule, validate } from '../../../_utils'
import { usePublicConfig } from '../../../_utils/context'

export interface FormItemIdentifyProps extends FormItemProps {}

export const FormItemIdentify: React.FC<FormItemIdentifyProps> = (props) => {
  const { ...formItemProps } = props

  const { t } = useTranslation()

  const config = usePublicConfig()

  const methods = useMemo<VerifyLoginMethods[]>(
    () => config?.verifyCodeTabConfig?.enabledLoginMethods ?? ['phone-code'],
    [config?.verifyCodeTabConfig]
  )

  const renderTemplate = useMemo(() => {
    if (methods.length !== 1)
      return (
        <FormItem
          validateTrigger={['onBlur', 'onChange']}
          validateFirst={true}
          rules={[
            ...fieldRequiredRule(t('common.phoneOrEmail')),
            {
              validator: async (_, value) => {
                if (
                  value &&
                  !validate('email', value) &&
                  !validate('phone', value)
                ) {
                  return Promise.reject(t('login.inputCorrectPhone'))
                }
              },
              validateTrigger: 'onBlur',
            },
          ]}
          {...formItemProps}
        />
      )

    switch (methods[0]) {
      case 'phone-code':
        return <CustomFormItem.Phone {...formItemProps} />
      case 'email-code':
        return <CustomFormItem.Email {...formItemProps} />
    }
  }, [formItemProps, methods, t])

  return <>{renderTemplate}</>
}
