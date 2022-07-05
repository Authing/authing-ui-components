import React, { FC, useState } from 'react'
import { Form, Input, Button, message } from 'antd'

import { validate } from '../../../_utils'
import {
  ResetPasswordStep1Props,
  ResetPwdMethods,
} from '../../../../components/AuthingGuard/types'
import { useGuardContext } from '../../../context/global/context'
import { EmailScene } from 'authing-js-sdk'
import { useTranslation } from 'react-i18next'

export const ResetPasswordStep1: FC<ResetPasswordStep1Props> = ({
  onSuccess,
}) => {
  const {
    state: { authClient, guardEvents },
  } = useGuardContext()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    const value = values.phoneOrEmail

    if (validate('email', value)) {
      try {
        setLoading(true)
        await authClient.sendEmail(value, EmailScene.ResetPassword)

        guardEvents.onPwdEmailSend?.(authClient)
        message.success(t('login.emailSent'))
        onSuccess(ResetPwdMethods.Email, value)
      } catch (e: any) {
        guardEvents.onPwdEmailSendError?.(e, authClient)
      } finally {
        setLoading(false)
      }
    } else if (validate('phone', value)) {
      onSuccess(ResetPwdMethods.Phone, value)
    }
  }

  return (
    <Form
      onSubmitCapture={() => setLoading(true)}
      onFinishFailed={() => setLoading(false)}
      onFinish={onFinish}
    >
      <Form.Item
        name="phoneOrEmail"
        validateTrigger="onBlur"
        rules={[
          {
            validator: (rule, value) => {
              if (!value) {
                return Promise.reject(t('login.inputPhoneOrEmail'))
              }
              if (validate('email', value) || validate('phone', value)) {
                return Promise.resolve()
              } else {
                return Promise.reject(t('login.inputCorrectPhone'))
              }
            },
          },
        ]}
      >
        <Input
          size="large"
          autoComplete="off"
          placeholder={t('login.inputPhoneOrEmail')}
        />
      </Form.Item>
      <Button
        className="authing-reset-pwd-btn"
        block
        type="primary"
        size="large"
        htmlType="submit"
        loading={loading}
      >
        {t('login.resetPwd')}
      </Button>
    </Form>
  )
}
