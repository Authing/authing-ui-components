import { SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { Form } from 'antd'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import { useAuthClient } from '../../Guard/authClient'
import { SendCode } from '../../SendCode'
import {
  fieldRequiredRule,
  getDeviceName,
  getUserRegisterParams,
} from '../../_utils'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'
import { InputNumber } from '../../InputNumber'
import {
  ICheckProps,
  PhoneFormItem,
  ValidatorFormItemProps,
} from '../../ValidatorRules'
import { Rule } from 'antd/lib/form'

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
  const submitButtonRef = useRef<any>(null)
  const authClient = useAuthClient()
  const [form] = Form.useForm()
  const [phone, setPhone] = useState<string>('')
  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)

  const ref = useRef<ICheckProps>(null)

  const verifyCodeLength = publicConfig?.verifyCodeLength ?? 4

  const [, onFinish] = useAsyncFn(
    async (values: any) => {
      try {
        submitButtonRef.current.onSpin(true)
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
    rules?: Rule[]
    FormItemFC?: React.ForwardRefExoticComponent<
      ValidatorFormItemProps & React.RefAttributes<ICheckProps>
    >
  }[] = [
    {
      component: (
        <InputNumber
          className="authing-g2-input"
          onChange={(e) => {
            setPhone(e.target.value)
          }}
          size="large"
          placeholder={t('login.inputPhone')}
          prefix={<UserOutlined style={{ color: '#878A95' }} />}
          maxLength={11}
        />
      ),
      name: 'phone',
      FormItemFC: PhoneFormItem,
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
          onSendCodeBefore={() => form.validateFields(['phone'])}
          data={phone}
        />
      ),
      name: 'code',
      rules: fieldRequiredRule(t('common.captchaCode')),
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
        onValuesChange={(values) => {
          ref.current?.check(values)
        }}
      >
        {formItems.map((item) =>
          item.FormItemFC ? (
            <item.FormItemFC
              ref={ref}
              key={item.name}
              name={item.name}
              className="authing-g2-input-form"
              validateFirst={true}
              userPoolId={publicConfig?.userPoolId!}
              form={form}
              checkRepeat={true}
            >
              {item.component}
            </item.FormItemFC>
          ) : (
            <Form.Item
              key={item.name}
              name={item.name}
              rules={item.rules}
              className="authing-g2-input-form"
              validateFirst={true}
            >
              {item.component}
            </Form.Item>
          )
        )}
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
