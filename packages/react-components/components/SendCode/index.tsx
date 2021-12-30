import { Col, message, Row } from 'antd'
import React, { FC } from 'react'
import { EmailScene, SceneType } from 'authing-js-sdk'

import { SendCodeBtn } from './SendCodeBtn'

import './style.less'
import { useTranslation } from 'react-i18next'
import { useGuardAuthClient } from '../Guard/authClient'
import { validate } from '../_utils'
import { InputProps } from 'antd/lib/input'
import { InputNumber } from '../InputNumber'

export interface SendPhoneCodeProps extends InputProps {
  method: 'phone' | 'email'
  data: string
  form?: any
  onSendCodeBefore?: any // 点击的时候先做这个
  fieldName?: string
  autoSubmit?: boolean //验证码输入完毕是否自动提交
  scene?: SceneType
}

export const SendCode: FC<SendPhoneCodeProps> = ({
  scene,
  method,
  data,
  value,
  onChange,
  autoSubmit = false,
  form,
  onSendCodeBefore,
  maxLength,
  fieldName,
  ...inputProps
}) => {
  const { t } = useTranslation()

  const authClient = useGuardAuthClient()

  const sendEmail = async (email: string) => {
    if (!email) {
      message.error(t('login.inputEmail'))
      return false
    }
    if (!validate('email', email)) {
      message.error(t('common.emailFormatError'))
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
      await authClient.sendSmsCode(phone, '', scene)
      return true
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        message.error(t('login.sendCodeTimeout'))
        return false
      }
      const { message: msg } = JSON.parse(error.message)
      message.error(msg)
      return false
    }
  }

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col span={15} className="g2-send-code-input-col">
          <InputNumber
            value={value}
            onChange={(e) => {
              onChange?.(e)
              if (!autoSubmit) return
              if (maxLength && e.target.value.length >= maxLength) {
                form?.submit()
              }
            }}
            {...inputProps}
            maxLength={maxLength}
          />
        </Col>
        <Col offset={1} span={8}>
          <SendCodeBtn
            beforeSend={() => {
              return onSendCodeBefore()
                .then(async (b: any) => {
                  let phoneData = form
                    ? form.getFieldValue(fieldName || method)
                    : data
                  return method === 'phone'
                    ? await sendPhone(phoneData)
                    : await sendEmail(phoneData)
                })
                .catch((e: any) => {
                  return false
                })
            }}
            sendDesc={t('common.sendVerifyCode')}
          />
        </Col>
      </Row>
    </>
  )
}
