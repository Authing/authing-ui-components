import Input, { InputProps } from 'antd/lib/input'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyLoginMethods } from '../../../AuthingGuard/api'
import { InputNumber } from '../../../InputNumber'
import { usePublicConfig } from '../../../_utils/context'

export interface InputIdentifyProps extends InputProps {}

export const InputIdentify: React.FC<InputIdentifyProps> = (props) => {
  const { ...inputProps } = props

  const config = usePublicConfig()

  const methods = useMemo<VerifyLoginMethods[]>(
    () => config?.verifyCodeTabConfig?.enabledLoginMethods ?? ['phone-code'],
    [config?.verifyCodeTabConfig]
  )

  const { t } = useTranslation()

  const verifyCodeMethodsText = useMemo<
    Record<
      VerifyLoginMethods,
      {
        t: string
        sort: number
      }
    >
  >(
    () => ({
      'email-code': {
        t: t('common.email'),
        sort: 2,
      },
      'phone-code': {
        t: t('common.phoneNumber'),
        sort: 1,
      },
    }),
    [t]
  )

  const placeholder = useMemo(
    () =>
      t('login.inputAccount', {
        text: methods
          ?.map((item) => verifyCodeMethodsText[item])
          .sort((a, b) => a.sort - b.sort)
          .map((item) => item.t)
          .join(' / '),
      }),
    [methods, t, verifyCodeMethodsText]
  )

  const renderInput = useMemo(() => {
    if (methods.length === 1 && methods[0] === 'phone-code') {
      return (
        <InputNumber maxLength={11} placeholder={placeholder} {...inputProps} />
      )
    }

    return <Input placeholder={placeholder} {...inputProps} />
  }, [inputProps, methods, placeholder])

  return <>{renderInput}</>
}
