import React, { FC, useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { SafetyOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'

import { getRequiredRules } from '@/utils'
import { useGuardContext } from '@/context/global/context'
import { ResetPasswordStep2Props } from '@/components/AuthingGuard/types'
import { SendPhoneCode } from '@/components/AuthingGuard/Forms/SendPhoneCode'

export const ResetPasswordStep2: FC<ResetPasswordStep2Props> = ({
  phone,
  onSuccess,
}) => {
  const [rawForm] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const {
    state: { authClient },
  } = useGuardContext()

  const onStep2Finish = async (values: any) => {
    const code = values.code
    const password = values.password

    try {
      const res = await authClient.resetPasswordByPhoneCode(
        phone,
        code,
        password
      )
      if (res.code === 200) {
        onSuccess()
      } else {
        message.error(res.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={rawForm}
      onSubmitCapture={() => setLoading(true)}
      onFinish={onStep2Finish}
    >
      <Form.Item
        name="phone"
        initialValue={phone}
        rules={getRequiredRules('手机号不能为空')}
      >
        <Input
          autoComplete="tel"
          name="phone"
          readOnly
          size="large"
          placeholder="请输入手机号"
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      </Form.Item>
      <Form.Item
        name="code"
        rules={getRequiredRules('请输入验证码').concat({
          len: 4,
          message: '请输入 4 位验证码',
        })}
      >
        <Input
          name="code"
          size="large"
          autoComplete="off"
          placeholder="4 位验证码"
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          suffix={<SendPhoneCode phone={phone} />}
        />
      </Form.Item>
      <Form.Item name="password" rules={getRequiredRules('新密码不能为空')}>
        <Input.Password
          name="password"
          size="large"
          autoComplete="off"
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
          autoComplete="off"
          placeholder="再输入一次密码"
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      </Form.Item>
      <Form.Item>
        <Button
          block
          loading={loading}
          type="primary"
          size="large"
          htmlType="submit"
        >
          重置密码
        </Button>
      </Form.Item>
    </Form>
  )
}
