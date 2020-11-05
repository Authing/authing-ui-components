import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { FormInstance, Rule } from 'antd/lib/form'
import { Alert, Form, Input } from 'antd'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons'

import { getRequiredRules, VALIDATE_PATTERN } from '@/utils'
import { useGlobalContext } from '@/context/global/context'
import { PhoneCodeLoginFormProps } from '@/components/AuthingGuard/types'
import { SendPhoneCode } from '@/components/AuthingGuard/Forms/PhoneCodeLoginForm/SendPhoneCode'
import { LoginFormFooter } from '@/components/AuthingGuard/Forms/LoginFormFooter'

import './style.less'

const rulesMap: Record<string, Rule[]> = {
  phone: getRequiredRules('请输入手机号码').concat({
    pattern: VALIDATE_PATTERN.phone,
    message: '手机号码格式不正确',
  }),
  code: getRequiredRules('请输入验证码'),
}

export const PhoneCodeLoginForm = forwardRef<
  FormInstance,
  PhoneCodeLoginFormProps
>(({ onSuccess, onFail, onValidateFail }, ref) => {
  const {
    state: { authClient, config },
  } = useGlobalContext()

  const [rawForm] = Form.useForm()

  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const onFinishFailed = (errorInfo: any) => {
    setLoading(false)
    onValidateFail && onValidateFail(errorInfo)
  }

  const onFinish = async (values: any) => {
    try {
      const { phone, code } = values
      const user = await authClient.loginByPhoneCode(phone, code)
      onSuccess && onSuccess(user)
    } catch (error) {
      onFail && onFail(error)
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => rawForm)

  return (
    <Form form={rawForm} onFinishFailed={onFinishFailed} onFinish={onFinish}>
      {config.autoRegister && (
        <Alert
          message="输入手机号验证码登录，如果您没有帐号，我们会自动创建。"
          style={{ marginBottom: 24 }}
        />
      )}
      <Form.Item name="phone" rules={rulesMap.phone}>
        <Input
          autoComplete="tel"
          onChange={(e) => {
            setPhone(e.target.value)
          }}
          size="large"
          placeholder="请输入手机号"
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      </Form.Item>
      <Form.Item name="code" rules={rulesMap.code}>
        <Input
          autoComplete="off"
          size="large"
          placeholder="请输入 4 位验证码"
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          addonAfter={<SendPhoneCode phone={phone} />}
        />
      </Form.Item>

      <LoginFormFooter
        onLogin={() => setLoading(true)}
        loading={loading}
      ></LoginFormFooter>
    </Form>
  )
})
