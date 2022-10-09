import { message } from 'antd'
import React, { FC } from 'react'
import { SceneType } from 'authing-js-sdk'
import './style.less'
import { useTranslation } from 'react-i18next'
import { useGuardAuthClient } from '../Guard/authClient'
import { InputProps } from 'antd/lib/input'
import { SendCode } from './index'
import { parsePhone } from '../_utils/hooks'
import { useGuardEvents } from '../_utils/context'
export interface SendCodeByPhoneProps extends InputProps {
  data?: string
  form?: any
  onSendCodeBefore?: any // 点击的时候先做这个
  fieldName?: string
  autoSubmit?: boolean //验证码输入完毕是否自动提交
  scene: SceneType
  areaCode?: string //国际区号
  isInternationSms?: boolean //是否是国际短信
}

export const SendCodeByPhone: FC<SendCodeByPhoneProps> = (props) => {
  const {
    scene,
    data,
    form,
    areaCode,
    onSendCodeBefore,
    fieldName,
    isInternationSms = false,
    ...remainProps
  } = props
  const { t } = useTranslation()

  const authClient = useGuardAuthClient()

  const events = useGuardEvents()

  const sendPhone = async (phone: string, countryCode?: string) => {
    try {
      await authClient.sendSmsCode(phone, countryCode, scene)
      return { status: true }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        message.error(t('login.sendCodeTimeout'))
        return {
          status: false,
          error,
        }
      }
      const { message: msg } = JSON.parse(error.message)
      message.error(msg)
      return {
        status: false,
        error,
      }
    }
  }

  return (
    <>
      <SendCode
        beforeSend={() => {
          return onSendCodeBefore()
            .then(async (b: any) => {
              let fieldValue = form
                ? form.getFieldValue(fieldName || 'phone')
                : data
              const { phoneNumber, countryCode } = parsePhone(
                isInternationSms,
                fieldValue,
                areaCode
              )

              const { status, error } = await sendPhone(
                phoneNumber,
                countryCode
              )
              if (status) {
                events?.onPhoneSend?.(authClient, scene)
              } else {
                events?.onPhoneSendError?.(error, authClient, scene)
              }
              return status
            })
            .catch((e: any) => {
              events?.onPhoneSendError?.(e, authClient, scene)
              return false
            })
        }}
        form={form}
        {...remainProps}
      />
    </>
  )
}
