import { Col, message, Row } from 'antd'
import React, { FC } from 'react'
import { EmailScene } from 'authing-js-sdk'

import { SendCodeBtn } from './SendCodeBtn'

import './style.less'
import { useTranslation } from 'react-i18next'
import { useAuthClient } from '../Guard/authClient'
import { validate } from '../_utils'
import Input, { InputProps } from 'antd/lib/input'

export interface SendPhoneCodeProps extends InputProps {
  method: 'phone' | 'email'
  data: string
  form?: any
  onSendCodeBefore?: any // 点击的时候先做这个
}

export const SendCode: FC<SendPhoneCodeProps> = ({
  method,
  data,
  value,
  onChange,
  form,
  onSendCodeBefore,
  ...inputProps
}) => {
  const { t } = useTranslation()

  const authClient = useAuthClient()

  const sendEmail = async (email: string) => {
    if (!email) {
      message.error(t('login.inputEmail'))
      return false
    }
    if (!validate('email', email)) {
      message.error('邮箱不正确')
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
        <Col span={15} className="g2-send-code-input-col">
          <Input
            value={value}
            onChange={(e) => {
              let v = e.target.value
              if (v.length > 4) {
                return
              }
              onChange?.(e)
            }}
            // maxLength={4}
            type="number" // antd bug：如果 type===number 则 maxLength 不生效
            {...inputProps}
          />
        </Col>
        <Col offset={1} span={8}>
          <SendCodeBtn
            beforeSend={() => {
              return onSendCodeBefore()
                .then(async (b: any) => {
                  let phoneData = form ? form.getFieldValue(method) : data
                  return method === 'phone'
                    ? await sendPhone(phoneData)
                    : await sendEmail(phoneData)
                })
                .catch((e: any) => {
                  // console.log('e', e)
                  return false
                })
            }}
          />
        </Col>
      </Row>
    </>
  )
}
