import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Input, Form } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

import {
  getDeviceName,
  getRequiredRules,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { EmailRegisterFormProps } from '../../../../components/AuthingGuard/types'
import { RegisterFormFooter } from '../../../../components/AuthingGuard/Forms/RegisterFormFooter'
import { useTranslation } from 'react-i18next'

export const EmailRegisterForm = forwardRef<
  FormInstance,
  EmailRegisterFormProps
>(({ onSuccess, onFail, onValidateFail }, ref) => {
  const { t } = useTranslation()
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
        {
          generateToken: true,
          params: getUserRegisterParams(),
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
          autoComplete="email"
          size="large"
          placeholder={t('login.inputEmail')}
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'email',
      rules: getRequiredRules(t('common.emailNotNull')).concat({
        pattern: VALIDATE_PATTERN.email,
        message: t('login.emailError'),
      }),
    },
    {
      component: (
        <Input.Password
          size="large"
          placeholder={t('common.setPassword')}
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'password',
      rules: getRequiredRules(t('common.passwordNotNull')),
    },
    {
      component: (
        <Input.Password
          size="large"
          placeholder={t('login.inputPwdAgain')}
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'new-password',
      rules: getRequiredRules(t('common.repeatPassword')).concat({
        validator: (rule, value) => {
          if (value !== rawForm.getFieldValue('password')) {
            return Promise.reject(t('common.repeatPasswordDoc'))
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
