import { message } from 'antd'
import React, { FC } from 'react'
import { SceneType } from 'authing-js-sdk'

import './style.less'
import { useTranslation } from 'react-i18next'
import { useGuardAuthClient } from '../Guard/authClient'
import { InputProps } from 'antd/lib/input'
import { SendCode } from './index'
export interface SendCodeByPhoneProps extends InputProps {
  data: string
  form?: any
  onSendCodeBefore?: any // 点击的时候先做这个
  fieldName?: string
  autoSubmit?: boolean //验证码输入完毕是否自动提交
  scene: SceneType
}

export const SendCodeByPhone: FC<SendCodeByPhoneProps> = (props) => {
  const {
    scene,
    data,
    form,
    onSendCodeBefore,
    fieldName,
    ...remainProps
  } = props
  const { t } = useTranslation()

  const authClient = useGuardAuthClient()

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
      <SendCode
        beforeSend={() => {
          return onSendCodeBefore()
            .then(async (b: any) => {
              let phone = form ? form.getFieldValue(fieldName || 'phone') : data
              return await sendPhone(phone)
            })
            .catch((e: any) => {
              return false
            })
        }}
        form={form}
        {...remainProps}
      />
    </>
  )
}