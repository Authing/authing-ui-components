import Input, { InputProps } from 'antd/lib/input'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PasswordLoginMethods } from '../../../AuthingGuard/api'
import { InputNumber } from '../../../InputNumber'

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
        sort: 2,
      },
      'phone-password': {
        t: t('common.phoneNumber'),
        sort: 1,
      },
      'username-password': {
        t: t('common.username'),
        sort: 0,
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
    console.log('runderInput', methods)
    console.log('runderInput', methods)
    console.log('runderInput', methods)
    console.log('runderInput', methods)
    if (methods.length === 1 && methods[0] === 'phone-password')
      return (
        <InputNumber maxLength={11} placeholder={placeholder} {...inputProps} />
      )

    return <Input placeholder={placeholder} {...inputProps} />
  }, [inputProps, methods, placeholder])

  return <>{runderInput}</>
}
