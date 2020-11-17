import { Input, Form } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { getRequiredRules } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { ADLoginFormProps } from '../../../../components/AuthingGuard/types'
import { LoginFormFooter } from '../../../../components/AuthingGuard/Forms/LoginFormFooter'

export const ADLoginForm = forwardRef<FormInstance, ADLoginFormProps>(
  ({ onSuccess, onValidateFail, onFail }, ref) => {
    const { state } = useGuardContext()
    const { authClient } = state

    const [loading, setLoading] = useState(false)

    const onFinishFailed = (errorInfo: any) => {
      setLoading(false)
      onValidateFail && onValidateFail(errorInfo)
    }

    const [rawForm] = Form.useForm()

    const onFinish = async (values: any) => {
      try {
        const identity = values.identity && values.identity.trim()
        const password = values.password && values.password.trim()
        const user = await authClient.loginByAd(identity, password)
        onSuccess && onSuccess(user)
      } catch (error) {
        if (typeof error.message === 'string') {
          // js sdk httpclient 的报错，这里只有一种情况就是用户开启了 mfa 的报错
          try {
            const errorData = JSON.parse(error.message)
            onFail && onFail(errorData)
            return
          } catch (_) {
            // do nothing
          }
        }
        onFail && onFail(error)
      } finally {
        setLoading(false)
      }
    }

    useImperativeHandle(ref, () => rawForm)

    return (
      <Form
        form={rawForm}
        onSubmitCapture={() => setLoading(true)}
        onFinishFailed={onFinishFailed}
        onFinish={onFinish}
      >
        <Form.Item name="identity" rules={getRequiredRules('请输入 AD 用户名')}>
          <Input
            autoComplete="email,username,tel"
            size="large"
            placeholder="请输入 AD 用户名"
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item name="password" rules={getRequiredRules('请输入 AD 密码')}>
          <Input.Password
            autoComplete="current-password"
            size="large"
            visibilityToggle={false}
            placeholder="请输入 AD 密码"
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <LoginFormFooter loading={loading}></LoginFormFooter>
      </Form>
    )
  }
)
