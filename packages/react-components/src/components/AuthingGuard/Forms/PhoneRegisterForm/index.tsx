import { Input, Form } from 'antd'
import { FormInstance } from 'antd/lib/form'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'

import { useGuardContext } from '../../../../context/global/context'
import { PhoneRegisterFormProps } from '../../../../components/AuthingGuard/types'
import {
  getDeviceName,
  getRequiredRules,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from '../../../../utils'
import { SendPhoneCode } from '../../../../components/AuthingGuard/Forms/SendPhoneCode'
import { RegisterFormFooter } from '../../../../components/AuthingGuard/Forms/RegisterFormFooter'
import { useTranslation } from 'react-i18next'

export const PhoneRegisterForm = forwardRef<
  FormInstance,
  PhoneRegisterFormProps
>(({ onSuccess, onFail, onValidateFail }, ref) => {
  const {
    state: { authClient },
  } = useGuardContext()
  const { t } = useTranslation()

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
          autoComplete="tel"
          onChange={(e) => {
            setPhone(e.target.value)
          }}
          size="large"
          placeholder={t('login.inputPhone')}
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'phone',
      rules: getRequiredRules(t('common.phoneNotNull')).concat({
        pattern: VALIDATE_PATTERN.phone,
        message: t('login.phoneError'),
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
    {
      component: (
        <Input
          autoComplete="one-time-code"
          size="large"
          placeholder={t('common.inputFourVerifyCode', {
            length: 4,
          })}
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          addonAfter={<SendPhoneCode phone={phone} />}
        />
      ),
      name: 'code',
      rules: getRequiredRules(t('common.captchaCodeNotNull')),
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
