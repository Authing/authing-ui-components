import Input, { InputProps } from 'antd/lib/input'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { InputNumber } from '../../../InputNumber'
import { PasswordLoginMethods } from '../../../Type/application'

export interface InputAccountProps extends InputProps {
  passwordLoginMethods: PasswordLoginMethods[]
}

export const InputAccount: React.FC<InputAccountProps> = (props) => {
  const { passwordLoginMethods: methods, ...inputProps } = props

  const { t } = useTranslation()

  const loginMethodsText = useMemo<
    Record<
      PasswordLoginMethods,
      {
        t: string
        sort: number
      }
    >
  >(
    () => ({
      'email-password': {
        t: t('common.email'),
        sort: 1,
      },
      'phone-password': {
        t: t('common.phoneNumber'),
        sort: 0,
      },
      'username-password': {
        t: t('common.username'),
        sort: 2,
      },
    }),
    [t]
  )

  const placeholder = useMemo(
    () =>
      t('login.inputAccount', {
        text: methods
          ?.map((item) => loginMethodsText[item])
          .sort((a, b) => a.sort - b.sort)
          .map((item) => item.t)
          .join(' / '),
      }),
    [loginMethodsText, methods, t]
  )

  const runderInput = useMemo(() => {
    if (methods.length === 1 && methods[0] === 'phone-password')
      return (
        <InputNumber maxLength={20} placeholder={placeholder} {...inputProps} />
      )

    return <Input maxLength={20} placeholder={placeholder} {...inputProps} />
  }, [inputProps, methods, placeholder])

  return <>{runderInput}</>
}
