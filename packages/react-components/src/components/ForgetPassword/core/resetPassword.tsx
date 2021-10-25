import React from 'react'
import { Button, Form, Input } from 'antd'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons'
import { LoginMethods } from 'src/components'
import { SendCode } from 'src/components/SendCode'
import { useTranslation } from 'react-i18next'

export const ResetPassword = (props: any) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let client = useAuthClient()

  const onFinish = async (values: any) => {
    // todo
  }

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="resetPassword"
        form={form}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          className="authing-g2-input-form"
          name="identify"
          rules={[{ required: true, message: '请输入手机号 / 邮箱' }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={'请输入手机号 / 邮箱'}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="code"
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          <SendCode
            className="authing-g2-input"
            autoComplete="one-time-code"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: 4,
            })}
            prefix={<SafetyOutlined style={{ color: '#878A95' }} />}
            method="phone"
            data={''}
            form={form}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="password"
          rules={[{ required: true, message: '请输入手机号 / 邮箱' }]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={'输入新密码'}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="authing-g2-submit-button "
          >
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
