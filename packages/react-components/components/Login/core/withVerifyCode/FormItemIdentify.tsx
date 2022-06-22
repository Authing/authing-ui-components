import { FormItemProps, Rule } from 'antd/lib/form'
import FormItem from 'antd/lib/form/FormItem'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CustomFormItem from '../../../ValidatorRules'
import { fieldRequiredRule, VALIDATE_PATTERN } from '../../../_utils'
import { phone } from 'phone'
import {
  useGuardHttpClient,
  useGuardPublicConfig,
} from '../../../_utils/context'
import { VerifyLoginMethods } from '../../../AuthingGuard/api'
import { useCheckRepeat } from '../../../ValidatorRules/useCheckRepeat'
import { parsePhone } from '../../../_utils/hooks'
export interface FormItemIdentifyProps extends FormItemProps {
  checkRepeat?: boolean
  methods: VerifyLoginMethods[]
  currentMethod: 'phone-code' | 'email-code' //当前 input 输入
  areaCode?: string //国际化手机号区号
}

const FindMethodConversion = {
  'phone-code': 'phone',
  'email-code': 'email',
}

export const FormItemIdentify: React.FC<FormItemIdentifyProps> = (props) => {
  const {
    methods,
    areaCode = 'CN',
    currentMethod,
    checkRepeat,
    ...formItemProps
  } = props
  const publicConfig = useGuardPublicConfig()
  const { t } = useTranslation()

  const { get } = useGuardHttpClient()

  const checkInternationalSms =
    publicConfig.internationalSmsConfig?.enabled &&
    currentMethod === 'phone-code'

  const methodContent = useMemo(() => {
    if (currentMethod === 'email-code')
      return {
        field: t('common.emailLabel'),
        checkErrorMessage: t('common.checkEmail'),
        formatErrorMessage: t('login.inputCorrectPhone'),
        pattern: VALIDATE_PATTERN.email,
      }
    else
      return {
        field: t('common.phone'),
        checkErrorMessage: t('common.checkPhone'),
        formatErrorMessage: t('login.inputCorrectPhone'),
        pattern: VALIDATE_PATTERN.phone,
      }
  }, [currentMethod, t])

  const checkRepeatRet = (
    value: any,
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void
  ) => {
    let checkValue = value
    if (currentMethod === 'phone-code' && checkInternationalSms) {
      const { phoneNumber } = parsePhone(
        checkInternationalSms,
        checkValue,
        areaCode
      )
      checkValue = phoneNumber
    }
    get<boolean>(`/api/v2/users/find`, {
      userPoolId: publicConfig?.userPoolId,
      key: checkValue,
      type: FindMethodConversion[currentMethod],
    }).then(({ data }) => {
      if (Boolean(data)) {
        reject(methodContent.checkErrorMessage)
      } else {
        resolve(true)
      }
    })
  }

  const checkRepeatFn = useCheckRepeat(checkRepeatRet)

  const formatRules = useMemo<Rule>(() => {
    if (checkInternationalSms) {
      return {
        validateTrigger: 'onBlur',
        validator: async (_, value) => {
          if (
            !value ||
            phone(value, { country: areaCode }).isValid ||
            phone(value).isValid
          )
            return Promise.resolve()
          return Promise.reject(t('common.i18nCheckErrorMessage'))
        },
      }
    }

    return {
      validateTrigger: 'onBlur',
      pattern: methodContent.pattern,
      message: methodContent.formatErrorMessage,
    }
  }, [
    areaCode,
    checkInternationalSms,
    methodContent.formatErrorMessage,
    methodContent.pattern,
    t,
  ])

  const rules = useMemo<Rule[]>(() => {
    // 如果不是必填就不校验

    // 必填项的默认校验规则
    const rules = [...fieldRequiredRule(t('common.phoneOrEmail'))]

    // 格式校验
    rules.push(formatRules)

    // 是否校验重复
    if (checkRepeat) {
      rules.push({
        validator: checkRepeatFn,
        validateTrigger: [],
      })
    }

    return rules
  }, [t, formatRules, checkRepeat, checkRepeatFn])
  // TODO 未来抽离
  const renderTemplate = useMemo(() => {
    if (methods.length !== 1)
      return (
        <FormItem
          validateTrigger={['onBlur', 'onChange']}
          validateFirst={true}
          rules={rules}
          {...formItemProps}
        />
      )

    switch (currentMethod) {
      case 'phone-code':
        return (
          <CustomFormItem.Phone
            areaCode={areaCode}
            {...formItemProps}
            checkRepeat={checkRepeat}
          />
        )
      case 'email-code':
        return (
          <CustomFormItem.Email {...formItemProps} checkRepeat={checkRepeat} />
        )
    }
  }, [
    areaCode,
    checkRepeat,
    currentMethod,
    formItemProps,
    methods.length,
    rules,
  ])

  return <>{renderTemplate}</>
}
