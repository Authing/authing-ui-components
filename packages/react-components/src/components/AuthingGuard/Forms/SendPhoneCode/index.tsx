import { message } from 'antd'
import React, { FC } from 'react'
import { CommonMessage } from 'authing-js-sdk'

import { SendCodeBtn } from './SendCodeBtn'
import { validate } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'

import './style.less'
import { useTranslation } from 'react-i18next'

export interface SendPhoneCodeProps {
  phone: string
  onSend?: () => void
  onError?: (error: CommonMessage) => void
}

export const SendPhoneCode: FC<SendPhoneCodeProps> = ({
  phone,
  onSend,
  onError,
}) => {
  const { t } = useTranslation()
  const {
    state: { authClient },
  } = useGuardContext()

  return (
    <SendCodeBtn
      beforeSend={async () => {
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
      }}
    />
  )
}
