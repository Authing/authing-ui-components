import { message } from 'antd'
import React, { FC } from 'react'

import { SendCodeBtn } from './SendCodeBtn'
import { validate } from '@/utils'
import { useGuardContext } from '@/context/global/context'

import './style.less'

export interface SendPhoneCodeProps {
  phone: string
}

export const SendPhoneCode: FC<SendPhoneCodeProps> = ({ phone }) => {
  const {
    state: { authClient },
  } = useGuardContext()

  return (
    <SendCodeBtn
      beforeSend={async () => {
        if (!phone) {
          message.error('请输入手机号')
          return false
        }
        if (!validate('phone', phone)) {
          message.error('手机号格式不正确')
          return false
        }
        try {
          await authClient.sendSmsCode(phone)
          return true
        } catch (error) {
          message.error(error.message)
          return false
        }
      }}
    />
  )
}
