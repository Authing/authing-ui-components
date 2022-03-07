import { FormItemProps } from 'antd/lib/form'
import FormItem from 'antd/lib/form/FormItem'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CustomFormItem from '../../../ValidatorRules'
import { fieldRequiredRule, validate } from '../../../_utils'
import { phone } from 'phone'
import { usePublicConfig } from '../../../_utils/context'
import { VerifyLoginMethods } from '../../../AuthingGuard/api'
import { defaultAreaCode } from '../../../_utils/hooks'
export interface FormItemIdentifyProps extends FormItemProps {
  checkRepeat?: boolean
  methods: VerifyLoginMethods[]
  currentMethod?: 'phone-code' | 'email-code' //当前 input 输入
  areaCode?: string //国际化手机号区号
}

export const FormItemIdentify: React.FC<FormItemIdentifyProps> = (props) => {
  const {
    methods,
    areaCode = defaultAreaCode,
    currentMethod,
    ...formItemProps
  } = props

  const publicConfig = usePublicConfig()
  console.log(currentMethod)
  const { t } = useTranslation()
  // TODO 未来抽离
  const renderTemplate = useMemo(() => {
    const rules = [...fieldRequiredRule(t('common.phoneOrEmail'))]
    if (currentMethod === 'email-code') {
      rules.push({
        validator: async (_: any, value: any) => {
          if (value && !validate('email', value)) {
            return Promise.reject(t('login.inputCorrectPhone'))
          }
        },
        validateTrigger: 'onBlur',
      })
    }
    // 单纯的手机号校验
    if (
      currentMethod === 'phone-code' &&
      publicConfig &&
      !publicConfig.internationalSmsConfig?.enabled
    ) {
      rules.push({
        validator: async (_: any, value: any) => {
          if (value && !validate('phone', value)) {
            return Promise.reject(t('login.inputCorrectPhone'))
          }
        },
        validateTrigger: 'onBlur',
      })
    }
    // 国际化校验规则
    if (
      publicConfig &&
      publicConfig.internationalSmsConfig?.enabled &&
      currentMethod === 'phone-code'
    ) {
      rules.push({
        validateTrigger: 'onBlur',
        validator: async (_: any, value: any) => {
          //无区号就走 默认区号
          if (
            value &&
            (phone(value, { country: areaCode }).isValid ||
              phone(value).isValid)
          ) {
            return Promise.resolve()
          }
          return Promise.reject(t('login.inputCorrectPhone'))
        },
      })
    }

    if (methods.length !== 1)
      return (
        <FormItem
          validateTrigger={['onBlur', 'onChange']}
          validateFirst={true}
          rules={rules}
          {...formItemProps}
        />
      )

    switch (methods[0]) {
      case 'phone-code':
        return <CustomFormItem.Phone areaCode={areaCode} {...formItemProps} />
      case 'email-code':
        return <CustomFormItem.Email {...formItemProps} />
    }
  }, [areaCode, currentMethod, formItemProps, methods, publicConfig, t])

  return <>{renderTemplate}</>
}
