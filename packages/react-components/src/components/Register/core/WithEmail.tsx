import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, message } from 'antd'
import { RegisterMethods } from 'authing-js-sdk'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement } from 'src/components/AuthingGuard/api'
import { useAuthClient } from 'src/components/Guard/authClient'
import {
  getDeviceName,
  getRequiredRules,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from 'src/utils'
import { Agreements } from '../components/Agreements'

export interface RegisterWithEmailProps {
  onRegister: Function
  onBeforeRegister?: Function
  agreements: Agreement[]
}

export const RegisterWithEmail: React.FC<RegisterWithEmailProps> = ({
  onRegister,
  onBeforeRegister,
  agreements,
}) => {
  const { t } = useTranslation()
  const authClient = useAuthClient()
  const [form] = Form.useForm()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)

  const [finish, onFinish] = useAsyncFn(
    async (values: any) => {
      if (onBeforeRegister) {
        try {
          const canRegister = await onBeforeRegister(
            {
              type: RegisterMethods.Phone,
              data: {
                phone: values.phone,
                password: values.password,
                code: values.code,
              },
            },
            authClient
          )

          if (!canRegister) {
            return
          }
        } catch (e) {
          if (typeof e === 'string') {
            message.error(e)
          } else {
            message.error(e.message)
          }
          return
        }
      }

      try {
        await form.validateFields()

        setValidated(true)

        if (agreements?.length && !acceptedAgreements) {
          return
        }

        const { email, password } = values

        // 注册
        const user = await authClient.registerByEmail(
          email,
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

        onRegister(200, user)
      } catch ({ code, data, message }) {
        onRegister(code, data, message)
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
          className="authing-g2-input"
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
          className="authing-g2-input"
          size="large"
          placeholder={t('login.inputPwdAgain')}
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'new-password',
      rules: getRequiredRules(t('common.repeatPassword')).concat({
        validator: (_, value) => {
          if (value !== form.getFieldValue('password')) {
            return Promise.reject(t('common.repeatPasswordDoc'))
          } else {
            return Promise.resolve()
          }
        },
      }),
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
