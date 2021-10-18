import { SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement } from 'src/components/AuthingGuard/api'
import { useAuthClient } from 'src/components/Guard/authClient'
import { SendCode } from 'src/components/SendCode'
import {
  getDeviceName,
  getRequiredRules,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from 'src/utils'
import { Agreements } from '../components/Agreements'

export interface RegisterWithPhoneProps {
  onRegister: Function
  onRegisterError: Function
  agreements: Agreement[]
}

export const RegisterWithPhone: React.FC<RegisterWithPhoneProps> = ({
  onRegister,
  onRegisterError,
  agreements,
}) => {
  const { t } = useTranslation()
  const authClient = useAuthClient()
  const [form] = Form.useForm()
  const [phone, setPhone] = useState<string>('')
  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)

  const [finish, onFinish] = useAsyncFn(
    async (values: any) => {
      try {
        await form.validateFields()

        setValidated(true)

        if (agreements?.length && !acceptedAgreements) {
          return
        }

        const { phone, password = '', code } = values

        // 注册
        const user = await authClient.registerByPhoneCode(
          phone,
          code,
          password,
          {
            browser:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
            device: getDeviceName(),
          },
          {
            generateToken: true,
            params: getUserRegisterParams(),
          }
        )

        onRegister(user)
      } catch (error) {
        onRegisterError(error)
      }
    },
    [form],
    { loading: false }
  )

  const formItems = [
    {
      component: (
        <Input
          className="authing-g2-input"
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
    // {
    //   component: (
    //     <Input.Password
    //       size="large"
    //       placeholder={t('common.setPassword')}
    //       prefix={<LockOutlined style={{ color: '#ddd' }} />}
    //     />
    //   ),
    //   name: 'password',
    //   rules: getRequiredRules(t('common.passwordNotNull')),
    // },
    // {
    //   component: (
    //     <Input.Password
    //       size="large"
    //       placeholder={t('login.inputPwdAgain')}
    //       prefix={<LockOutlined style={{ color: '#ddd' }} />}
    //     />
    //   ),
    //   name: 'new-password',
    //   rules: getRequiredRules(t('common.repeatPassword')).concat({
    //     validator: (rule, value) => {
    //       if (value !== form.getFieldValue('password')) {
    //         return Promise.reject(t('common.repeatPasswordDoc'))
    //       } else {
    //         return Promise.resolve()
    //       }
    //     },
    //   }),
    // },
    {
      component: (
        <SendCode
          className="authing-g2-input"
          autoComplete="one-time-code"
          size="large"
          placeholder={t('common.inputFourVerifyCode', {
            length: 4,
          })}
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          method="phone"
          data={phone}
        />
      ),
      name: 'code',
      rules: getRequiredRules(t('common.captchaCodeNotNull')),
    },
  ]

  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onFinish={onFinish}
      >
        {formItems.map((item) => (
          <Form.Item key={item.name} name={item.name} rules={item.rules}>
            {item.component}
          </Form.Item>
        ))}
        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="authing-g2-register-button email"
            loading={finish.loading}
          >
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
