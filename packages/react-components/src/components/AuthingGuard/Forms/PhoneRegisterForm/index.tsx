import { Input, Form } from 'antd'
import { FormInstance } from 'antd/lib/form'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'

import { useGuardContext } from '@/context/global/context'
import { PhoneRegisterFormProps } from '@/components/AuthingGuard/types'
import { getDeviceName, getRequiredRules, VALIDATE_PATTERN } from '@/utils'
import { SendPhoneCode } from '@/components/AuthingGuard/Forms/SendPhoneCode'
import { RegisterFormFooter } from '@/components/AuthingGuard/Forms/RegisterFormFooter'

export const PhoneRegisterForm = forwardRef<
  FormInstance,
  PhoneRegisterFormProps
>(({ onSuccess, onFail, onValidateFail }, ref) => {
  const {
    state: { authClient },
  } = useGuardContext()

  const [rawForm] = Form.useForm()

  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const onFinishFailed = (errorInfo: any) => {
    setLoading(false)
    onValidateFail && onValidateFail(errorInfo)
  }

  const onFinish = async (values: any) => {
    try {
      await rawForm.validateFields()
      const { phone, code, password } = values
      const user = await authClient.registerByPhoneCode(
        phone,
        code,
        password,
        {
          browser: navigator.userAgent,
          device: getDeviceName(),
        },
        {
          generateToken: true,
        }
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
          autoComplete="tel"
          onChange={(e) => {
            setPhone(e.target.value)
          }}
          size="large"
          placeholder="请输入手机号"
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'phone',
      rules: getRequiredRules('手机号不能为空').concat({
        pattern: VALIDATE_PATTERN.phone,
        message: '手机号格式错误',
      }),
    },
    {
      component: (
        <Input.Password
          autoComplete="off"
          size="large"
          visibilityToggle={false}
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
          autoComplete="off"
          size="large"
          visibilityToggle={false}
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
    {
      component: (
        <Input
          autoComplete="one-time-code"
          size="large"
          placeholder="请输入 4 位验证码"
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          addonAfter={<SendPhoneCode phone={phone} />}
        />
      ),
      name: 'code',
      rules: getRequiredRules('验证码不能为空'),
    },
  ]

  return (
    <Form
      form={rawForm}
      onSubmitCapture={() => setLoading(true)}
      onFinishFailed={onFinishFailed}
      onFinish={onFinish}
    >
      {formItems.map((item) => (
        <Form.Item name={item.name} key={item.name} rules={item.rules}>
          {item.component}
        </Form.Item>
      ))}

      <RegisterFormFooter loading={loading} />
    </Form>
  )
})
