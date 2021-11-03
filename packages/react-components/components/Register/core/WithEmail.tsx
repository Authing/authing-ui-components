import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Form, Input, message } from 'antd'
import { Rule } from 'antd/lib/form'
import { RegisterMethods } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import { useAuthClient } from '../../Guard/authClient'
import { useDebounce } from '../../_utils/hooks'
import {
  fieldRequiredRule,
  getDeviceName,
  getPasswordValidate,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from '../../_utils'
import { useGuardHttp } from '../../_utils/guradHttp'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'

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
  const submitButtonRef = useRef<any>(null)

  const authClient = useAuthClient()
  const { get } = useGuardHttp()
  const [form] = Form.useForm()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)
  const [isFind, setIsFind] = useState<boolean>(false)

  // 检查手机号是否已经被注册过了 by my son donglyc
  const handleCheckEmail = useDebounce(async (value: any) => {
    const email: string = value?.email

    if (value.email && VALIDATE_PATTERN.email.test(email)) {
      let { data } = await get<boolean>(`/api/v2/users/find`, {
        userPoolId: publicConfig?.userPoolId,
        key: form.getFieldValue('email'),
        type: 'email',
      })
      setIsFind(Boolean(data))
      form.validateFields(['email'])
    } else {
      setIsFind(false)
    }
  }, 1000)

  const [, onFinish] = useAsyncFn(
    async (values: any) => {
      submitButtonRef.current.onSpin(true)
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
            submitButtonRef.current.onSpin(false)
            return
          }
        } catch (e: any) {
          if (typeof e === 'string') {
            message.error(e)
          } else {
            message.error(e?.message)
          }
          submitButtonRef.current.onSpin(false)
          return
        }
      }

      try {
        await form.validateFields()
        setValidated(true)
        if (agreements?.length && !acceptedAgreements) {
          submitButtonRef.current.onSpin(false)
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
        submitButtonRef.current.onSpin(false)
        onRegister(200, user)
      } catch ({ code, data, message }) {
        submitButtonRef.current.onSpin(false)
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
        ...fieldRequiredRule(t('common.emailLabel')),
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
          placeholder={t('login.inputPwd')}
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
          placeholder={t('common.passwordAgain')}
          prefix={<LockOutlined style={{ color: '#878A95' }} />}
        />
      ),
      name: 'new-password',
      rules: [
        ...getPasswordValidate(
          publicConfig?.passwordStrength,
          publicConfig?.customPasswordStrength
        ),
        {
          validator: (_, value) => {
            if (value !== form.getFieldValue('password')) {
              return Promise.reject(t('common.repeatPasswordDoc'))
            } else {
              return Promise.resolve()
            }
          },
        },
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
        onFinishFailed={() => submitButtonRef.current.onError()}
        onValuesChange={handleCheckEmail}
      >
        {formItems.map((item) => (
          <Form.Item
            key={item.name}
            name={item.name}
            rules={item.rules}
            className="authing-g2-input-form"
            validateFirst={true}
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
          <SubmitButton text={t('common.register')} ref={submitButtonRef} />
        </Form.Item>
      </Form>
    </div>
  )
}
