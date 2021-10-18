import { message } from 'antd'
import React, { FC } from 'react'
import { CommonMessage, EmailScene } from 'authing-js-sdk'

import { SendCodeBtn } from './SendCodeBtn'

import './style.less'
import { useTranslation } from 'react-i18next'
import { useAuthClient } from '../Guard/authClient'
import { validate } from 'src/utils'

export interface SendPhoneCodeProps {
  method: 'phone' | 'email'
  data: string
  onSend?: () => void
  onError?: (error: CommonMessage) => void
}

export const SendCode: FC<SendPhoneCodeProps> = ({
  method,
  data,
  onSend,
  onError,
}) => {
  const { t } = useTranslation()

  const authClient = useAuthClient()

  const sendEmail = async (email: string) => {
    if (!email) {
      message.error(t('login.inputPhone'))
      return false
    }
    if (!validate('email', email)) {
      message.error(t('common.phoneFormateError'))
      return false
    }
    try {
      await authClient.sendEmail(email, EmailScene.ResetPassword)
      onSend?.()
      return true
    } catch (error) {
      onError?.(error)
      return false
    }
  }

  const sendPhone = async (phone: string) => {
    if (!phone) {
      message.error(t('login.inputPhone'))
      return false
    }
    if (!validate('phone', phone)) {
      message.error(t('common.phoneFormateError'))
      return false
    }
    try {
      await authClient.sendSmsCode(phone)
      onSend?.()
      return true
    } catch (error) {
      onError?.(error)
      return false
    }
  }
  return (
    <SendCodeBtn
      beforeSend={async () =>
        method === 'phone' ? await sendPhone(data) : await sendEmail(data)
      }
    />
  )
}
