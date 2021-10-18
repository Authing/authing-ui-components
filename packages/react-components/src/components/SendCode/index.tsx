import { Col, message, Row } from 'antd'
import React, { FC } from 'react'
import { EmailScene } from 'authing-js-sdk'

import { SendCodeBtn } from './SendCodeBtn'

import './style.less'
import { useTranslation } from 'react-i18next'
import { useAuthClient } from '../Guard/authClient'
import { validate } from 'src/utils'
import Input, { InputProps } from 'antd/lib/input'

export interface SendPhoneCodeProps extends InputProps {
  method: 'phone' | 'email'
  data: string
}

export const SendCode: FC<SendPhoneCodeProps> = ({
  method,
  data,
  value,
  onChange,
  ...inputProps
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
      // onSend?.()
      return true
    } catch (error) {
      // onError?.(error)
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
      return true
    } catch (error) {
      return false
    }
  }
  return (
    <>
      <Row justify="space-between" align="middle">
        <Col span={14}>
          <Input {...inputProps} value={value} onChange={onChange} />
        </Col>
        <Col>
          <SendCodeBtn
            beforeSend={async () =>
              method === 'phone' ? await sendPhone(data) : await sendEmail(data)
            }
          />
        </Col>
      </Row>
    </>
  )
}
