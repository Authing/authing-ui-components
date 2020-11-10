import React, { FC, useState } from 'react'
import { Form, Input, Button, message } from 'antd'

import { validate } from '../../../../utils'
import {
  ResetPasswordStep1Props,
  ResetPwdMethods,
} from '../../../../components/AuthingGuard/types'
import { useGuardContext } from '../../../../context/global/context'
import { EmailScene } from 'authing-js-sdk'

export const ResetPasswordStep1: FC<ResetPasswordStep1Props> = ({
  onSuccess,
}) => {
  const {
    state: { authClient, guardEvents },
  } = useGuardContext()

  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    const value = values.phoneOrEmail

    if (validate('email', value)) {
      try {
        setLoading(true)
        await authClient.sendEmail(value, EmailScene.ResetPassword)

        guardEvents.onPwdEmailSend?.(authClient)
        message.success('邮件发送成功')
        onSuccess(ResetPwdMethods.Email, value)
      } catch (e) {
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
                return Promise.reject('手机号或邮箱不能为空')
              }
              if (validate('email', value) || validate('phone', value)) {
                return Promise.resolve()
              } else {
                return Promise.reject('请输入正确的手机号或邮箱')
              }
            },
          },
        ]}
      >
        <Input
          size="large"
          autoComplete="tel,email"
          placeholder="请输入手机号或邮箱"
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
        重置密码
      </Button>
    </Form>
  )
}
