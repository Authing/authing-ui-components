import { message } from 'antd'
import React, { FC } from 'react'
import { SceneType } from 'authing-js-sdk'
import './style.less'
import { useTranslation } from 'react-i18next'
import { useGuardAuthClient } from '../Guard/authClient'
import { InputProps } from 'antd/lib/input'
import { SendCode } from './index'
import phone from 'phone'
export interface SendCodeByPhoneProps extends InputProps {
  data: string
  form?: any
  onSendCodeBefore?: any // 点击的时候先做这个
  fieldName?: string
  autoSubmit?: boolean //验证码输入完毕是否自动提交
  scene: SceneType
  areaCode?: string //国际区号
}

export const SendCodeByPhone: FC<SendCodeByPhoneProps> = (props) => {
  const {
    scene,
    data,
    form,
    areaCode,
    onSendCodeBefore,
    fieldName,
    ...remainProps
  } = props
  const { t } = useTranslation()

  const authClient = useGuardAuthClient()

  const sendPhone = async (phone: string, countryCode?: string) => {
    try {
      await authClient.sendSmsCode(phone, countryCode, scene)
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
              let fieldValue = form
                ? form.getFieldValue(fieldName || 'phone')
                : data

              let phoneNumber = fieldValue
              let countryCode = areaCode
              // 走到这步 起码通过了 默认区号的校验 phone(fieldValue,{country:areaCode}) 或者 phone(fieldValue)
              if (phone(fieldValue, { country: areaCode }).isValid) {
                const parsePhone = phone(fieldValue, { country: areaCode })
                phoneNumber = parsePhone.phoneNumber
                countryCode = parsePhone.countryCode as string
              } else if (phone(fieldValue).isValid) {
                const parsePhone = phone(fieldValue)
                phoneNumber = parsePhone.phoneNumber
                countryCode = parsePhone.countryCode as string
              }

              return await sendPhone(phoneNumber, countryCode)
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
