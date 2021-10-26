import { SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import { useAuthClient } from '../../Guard/authClient'
import { SendCode } from '../../SendCode'
import { useDebounce } from '../../_utils/hooks'
import {
  getDeviceName,
  getRequiredRules,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from '../../_utils'
import { useGuardHttp } from '../../_utils/guradHttp'
import { Agreements } from '../components/Agreements'

export interface RegisterWithPhoneProps {
  onRegister: Function
  agreements: Agreement[]
  publicConfig?: ApplicationConfig
}

export const RegisterWithPhone: React.FC<RegisterWithPhoneProps> = ({
  onRegister,
  agreements,
  publicConfig,
}) => {
  const { t } = useTranslation()
  const authClient = useAuthClient()
  const [form] = Form.useForm()
  const { get } = useGuardHttp()
  const [phone, setPhone] = useState<string>('')
  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)
  const [isFind, setIsFind] = useState<boolean>(false)

  const verifyCodeLength = publicConfig?.verifyCodeLength ?? 4

  // 检查手机号是否已经被注册过了 by my son donglyc
  const handleCheckPhone = useDebounce(async (value: any) => {
    if (value.phone) {
      let { data } = await get(`/api/v2/users/find`, {
        userPoolId: publicConfig?.userPoolId,
        key: form.getFieldValue('phone'),
        type: 'phone',
      })
      setIsFind(Boolean(data))
      form.validateFields(['phone'])
    }
  }, 1000)

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
          autoComplete="tel"
          onChange={(e) => {
            setPhone(e.target.value)
          }}
          size="large"
          placeholder={t('login.inputPhone')}
          prefix={<UserOutlined style={{ color: '#878A95' }} />}
        />
      ),
      name: 'phone',
      rules: [
        ...getRequiredRules(t('common.phoneNotNull')).concat({
          pattern: VALIDATE_PATTERN.phone,
          message: t('login.phoneError'),
        }),
        {
          validator: (_: any, value: string) => {
            if (value) {
              if (VALIDATE_PATTERN.phone.test(value)) {
                if (isFind) {
                  return Promise.reject(t('common.checkPhone'))
                } else {
                  return Promise.resolve()
                }
              } else {
                return Promise.reject(new Error(t('common.phoneFormateError')))
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
        <SendCode
          className="authing-g2-input"
          autoComplete="one-time-code"
          size="large"
          placeholder={t('common.inputFourVerifyCode', {
            length: verifyCodeLength,
          })}
          maxLength={verifyCodeLength}
          prefix={<SafetyOutlined style={{ color: '#878A95' }} />}
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
        onValuesChange={handleCheckPhone}
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
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
