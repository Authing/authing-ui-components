import { FormItemProps } from 'antd/lib/form'
import FormItem from 'antd/lib/form/FormItem'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { InputMethod } from '.'
// import { VerifyLoginMethods } from '../../../AuthingGuard/api'
import CustomFormItem from '../../../ValidatorRules'
import { fieldRequiredRule, validate } from '../../../_utils'

export interface FormItemIdentifyProps extends FormItemProps {
  checkRepeat?: boolean
  methods: InputMethod
  areaCode?: string //国际化手机号区号
}

export const FormItemIdentify: React.FC<FormItemIdentifyProps> = (props) => {
  const { methods, areaCode, ...formItemProps } = props

  const { t } = useTranslation()

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
            // TODO 国际化校验规则
          ]}
          {...formItemProps}
        />
      )

    switch (methods[0]) {
      case 'phone-code':
        return <CustomFormItem.Phone areaCode={areaCode} {...formItemProps} />
      case 'email-code':
        return <CustomFormItem.Email {...formItemProps} />
    }
  }, [areaCode, formItemProps, methods, t])

  return <>{renderTemplate}</>
}
