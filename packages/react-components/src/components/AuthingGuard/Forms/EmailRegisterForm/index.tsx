import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Input, Form } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

import { getDeviceName, getRequiredRules, VALIDATE_PATTERN } from '@/utils'
import { useGuardContext } from '@/context/global/context'
import { EmailRegisterFormProps } from '@/components/AuthingGuard/types'
import { RegisterFormFooter } from '@/components/AuthingGuard/Forms/RegisterFormFooter'

export const EmailRegisterForm = forwardRef<
  FormInstance,
  EmailRegisterFormProps
>(({ onSuccess, onFail, onValidateFail }, ref) => {
  const {
    state: { authClient },
  } = useGuardContext()

  const [rawForm] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const onFinishFailed = (errorInfo: any) => {
    setLoading(false)
    onValidateFail && onValidateFail(errorInfo)
  }

  const onFinish = async (values: any) => {
    try {
      await rawForm.validateFields()
      const { email, password } = values
      // 注册并获取登录态
      const user = await authClient.registerByEmail(
        email,
        password,
        {
          browser: navigator.userAgent,
          device: getDeviceName(),
        },
        { generateToken: true }
      )
      onSuccess && onSuccess(user)
    } catch (error) {
      onFail && onFail(error)
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => rawForm)

  const formItems = [
    {
      component: (
        <Input
          autoComplete="email"
          size="large"
          placeholder="请输入邮箱"
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'email',
      rules: getRequiredRules('邮箱不能为空').concat({
        pattern: VALIDATE_PATTERN.email,
        message: '邮箱格式错误',
      }),
    },
    {
      component: (
        <Input.Password
          size="large"
          placeholder="设置密码"
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'password',
      rules: getRequiredRules('密码不能为空'),
    },
    {
      component: (
        <Input.Password
          size="large"
          placeholder="再输入一次密码"
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'new-password',
      rules: getRequiredRules('请重复密码').concat({
        validator: (rule, value) => {
          if (value !== rawForm.getFieldValue('password')) {
            return Promise.reject('两次密码必须一致')
          } else {
            return Promise.resolve()
          }
        },
      }),
    },
  ]

  return (
    <Form
      form={rawForm}
      onFinish={onFinish}
      onSubmitCapture={() => setLoading(true)}
      onFinishFailed={onFinishFailed}
    >
      {formItems.map((item) => (
        <Form.Item key={item.name} name={item.name} rules={item.rules}>
          {item.component}
        </Form.Item>
      ))}

      <RegisterFormFooter loading={loading} />
    </Form>
  )
})
