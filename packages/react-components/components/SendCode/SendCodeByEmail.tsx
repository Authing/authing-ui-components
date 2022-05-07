import { message } from 'antd'
import React, { FC } from 'react'
import './style.less'
import { useTranslation } from 'react-i18next'
import { validate } from '../_utils'
import { InputProps } from 'antd/lib/input'
import { SendCode } from './index'
import { getGuardHttp } from '../_utils/guardHttp'
import { EmailScene } from '../Type'
export interface SendCodeByEmailProps extends InputProps {
  data: string
  form?: any
  onSendCodeBefore?: any // 点击的时候先做这个
  fieldName?: string
  autoSubmit?: boolean //验证码输入完毕是否自动提交
  scene: EmailScene
}

export const SendCodeByEmail: FC<SendCodeByEmailProps> = (props) => {
  const {
    scene,
    data,
    form,
    onSendCodeBefore,
    fieldName,
    ...remainProps
  } = props
  const { t } = useTranslation()

  const { post } = getGuardHttp()
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
      const { onGuardHandling, code } = await post('/api/v2/email/send', {
        email,
        scene,
      })
      if (code === 200) {
        return true
      } else {
        onGuardHandling?.()
        return false
      }
      // await await authClient.sendEmail(email, scene)
      // onSend?.()
    } catch (error) {
      // onError?.(error)
      return false
    }
  }

  return (
    <SendCode
      beforeSend={() => {
        return onSendCodeBefore()
          .then(async (b: any) => {
            let email = form ? form.getFieldValue(fieldName || 'email') : data
            return await sendEmail(email)
          })
          .catch((e: any) => {
            return false
          })
      }}
      form={form}
      {...remainProps}
    />
  )
}
