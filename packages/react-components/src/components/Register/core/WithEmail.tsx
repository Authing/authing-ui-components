import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, message } from 'antd'
import { Rule } from 'antd/lib/form'
import { RegisterMethods } from 'authing-js-sdk'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement, ApplicationConfig } from 'src/components/AuthingGuard/api'
import { useAuthClient } from 'src/components/Guard/authClient'
import { useDebounce } from 'src/hooks'
import {
  getDeviceName,
  getPasswordValidate,
  getRequiredRules,
  getUserRegisterParams,
  PASSWORD_STRENGTH_TEXT_MAP,
  VALIDATE_PATTERN,
} from 'src/utils'
import { useGuardHttp } from 'src/utils/guradHttp'
import { Agreements } from '../components/Agreements'

export interface RegisterWithEmailProps {
  onRegister: Function
  onBeforeRegister?: Function
  publicConfig?: ApplicationConfig
  agreements: Agreement[]
}

export const RegisterWithEmail: React.FC<RegisterWithEmailProps> = ({
  onRegister,
  onBeforeRegister,
  agreements,
  publicConfig,
}) => {
  const { t } = useTranslation()
  const authClient = useAuthClient()
  const { get } = useGuardHttp()
  const [form] = Form.useForm()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)
  const [isFind, setIsFind] = useState<boolean>(false)

  // 检查手机号是否已经被注册过了 by my son donglyc
  const handleCheckEmail = useDebounce(async (value: any) => {
    if (value.email) {
      let { data } = await get<boolean>(`/api/v2/users/find`, {
        userPoolId: publicConfig?.userPoolId,
        key: form.getFieldValue('email'),
        type: 'email',
      })
      setIsFind(Boolean(data))
      form.validateFields(['email'])
    }
  }, 1000)

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

  const formItems: {
    component: React.ReactNode
    name: string
    rules: Rule[]
  }[] = [
    {
      component: (
        <Input
          className="authing-g2-input"
          autoComplete="email"
          size="large"
          placeholder={t('login.inputEmail')}
          prefix={<UserOutlined style={{ color: '#878A95' }} />}
        />
      ),
      name: 'email',
      rules: [
        ...getRequiredRules(t('common.emailNotNull')),
        {
          validator: (rule, value) => {
            if (value) {
              if (VALIDATE_PATTERN.email.test(value)) {
                if (isFind) {
                  return Promise.reject(t('common.checkEmail'))
                } else {
                  return Promise.resolve()
                }
              } else {
                return Promise.reject(new Error(t('common.emailFormatError')))
              }
            } else {
              return Promise.resolve()
            }
          },
        },
      ],
    },
    {
      component: (
        <Input.Password
          className="authing-g2-input"
          size="large"
          placeholder={PASSWORD_STRENGTH_TEXT_MAP[
            publicConfig?.passwordStrength!
          ].placeholder()}
          prefix={<LockOutlined style={{ color: '#878A95' }} />}
        />
      ),
      name: 'password',
      rules: [
        {
          validator(_, value) {
            if ((value ?? '').indexOf(' ') !== -1) {
              return Promise.reject(t('common.checkPasswordHasSpace'))
            }
            return Promise.resolve()
          },
        },
        ...getPasswordValidate(
          publicConfig?.passwordStrength,
          publicConfig?.customPasswordStrength
        ),
      ],
    },
    {
      component: (
        <Input.Password
          className="authing-g2-input"
          size="large"
          placeholder={PASSWORD_STRENGTH_TEXT_MAP[
            publicConfig?.passwordStrength!
          ].placeholder()}
          prefix={<LockOutlined style={{ color: '#878A95' }} />}
        />
      ),
      name: 'new-password',
      rules: [
        {
          validator: (_, value) => {
            if (value !== form.getFieldValue('password')) {
              return Promise.reject(t('common.repeatPasswordDoc'))
            } else {
              return Promise.resolve()
            }
          },
        },
        ...getPasswordValidate(
          publicConfig?.passwordStrength,
          publicConfig?.customPasswordStrength
        ),
      ],
    },
  ]

  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onFinish={onFinish}
        onValuesChange={handleCheckEmail}
      >
        {formItems.map((item) => (
          <Form.Item
            key={item.name}
            name={item.name}
            rules={item.rules}
            className="authing-g2-input-form"
          >
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
            className="authing-g2-submit-button email"
            loading={finish.loading}
          >
            {t('common.register')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
