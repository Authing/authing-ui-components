import React, { FC, useState } from 'react'
import { Form, Button, Input, message } from 'antd'
import { SafetyOutlined, LockOutlined } from '@ant-design/icons'
import { EmailScene } from 'authing-js-sdk'

import { getRequiredRules } from '@/utils'
import { useGuardContext } from '@/context/global/context'
import { ResetPasswordStep3Props } from '@/components/AuthingGuard/types'

export const ResetPasswordStep3: FC<ResetPasswordStep3Props> = ({
  email,
  onSuccess = () => {},
  onFail,
}) => {
  const {
    state: { authClient, guardEvents },
  } = useGuardContext()
  const [rawForm] = Form.useForm()

  const [reseting, setReseting] = useState(false)
  const [sending, setSending] = useState(false)

  const onSendResetMail = async () => {
    setSending(true)
    try {
      await authClient.sendEmail(email, EmailScene.ResetPassword)
      message.success('邮件发送成功')
      guardEvents.onPwdEmailSend?.(authClient)
    } catch(e) {
      guardEvents.onPwdEmailSendError?.(e, authClient)
    } finally {
      setSending(false)
    }
  }

  const onStep3Finish = async (values: any) => {
    const code = values.code
    const password = values.password
    try {
      const res = await authClient.resetPasswordByEmailCode(
        email,
        code,
        password
      )
      onSuccess()
    } catch (error) {
      onFail?.(error)
    } finally {
      setReseting(false)
    }
  }

  return (
    <>
      <p
        style={{
          marginBottom: 24,
          padding: '0 12px',
        }}
      >
        重置密码邮件已发送至邮箱 {email}，有效期为 24 小时。
      </p>

      <Form
        form={rawForm}
        onFinishFailed={() => setReseting(false)}
        onSubmitCapture={() => setReseting(true)}
        onFinish={onStep3Finish}
      >
        <Form.Item
          name="code"
          rules={getRequiredRules('请重复密码').concat({
            len: 4,
            message: '请输入 4 位验证码',
          })}
        >
          <Input
            name="code"
            size="large"
            placeholder="4 位验证码"
            prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item name="password" rules={getRequiredRules('新密码不能为空')}>
          <Input.Password
            name="password"
            size="large"
            placeholder="新密码"
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item
          name="repeat-password"
          rules={getRequiredRules('请重复密码').concat({
            validator: async (rule, value) => {
              if (rawForm.getFieldValue('password') !== value) {
                throw new Error('两次输入的密码需要一致')
              }
            },
          })}
        >
          <Input.Password
            name="repeat-password"
            size="large"
            placeholder="再输入一次密码"
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item>
          <Button
            className="authing-reset-pwd-btn"
            block
            loading={reseting}
            type="primary"
            size="large"
            htmlType="submit"
          >
            重置密码
          </Button>
        </Form.Item>
        <Button
          block
          type="primary"
          ghost
          loading={sending}
          size="large"
          onClick={onSendResetMail}
        >
          重发密码重置邮件
        </Button>
      </Form>
    </>
  )
}
