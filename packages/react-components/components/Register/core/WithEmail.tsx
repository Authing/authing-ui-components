import { Form, Input, message } from 'antd'
import { RegisterMethods } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import { useGuardAuthClient } from '../../Guard/authClient'
import { getDeviceName, getUserRegisterParams } from '../../_utils'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'
import CustomFormItem, { ICheckProps } from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'

export interface RegisterWithEmailProps {
  onRegister: Function
  onBeforeRegister?: Function
  publicConfig?: ApplicationConfig
  agreements: Agreement[]
  registeContext?: any
}

export const RegisterWithEmail: React.FC<RegisterWithEmailProps> = ({
  onRegister,
  onBeforeRegister,
  agreements,
  registeContext,
}) => {
  const { t } = useTranslation()
  const submitButtonRef = useRef<any>(null)

  const authClient = useGuardAuthClient()
  const [form] = Form.useForm()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)
  const ref = useRef<ICheckProps>(null)

  const [, onFinish] = useAsyncFn(
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
          // message.error(t('common.registerProtocolTips'))
          submitButtonRef.current.onError()
          // submitButtonRef.current.onSpin(false)
          return
        }
        const { email, password } = values

        const context = registeContext ?? {}

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
            context,
            generateToken: true,
            params: getUserRegisterParams(),
          }
        )
        submitButtonRef.current.onSpin(false)
        onRegister(200, user)
      } catch (error: any) {
        const { code, data, message } = error

        submitButtonRef.current.onError()
        onRegister(code, data, message)
      } finally {
        submitButtonRef.current.onSpin(false)
      }
    },
    [form, acceptedAgreements],
    { loading: false }
  )

  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onFinish={(values: any) => {
          submitButtonRef.current.onSpin(true)
          onFinish(values)
        }}
        onFinishFailed={() => submitButtonRef.current.onError()}
        onValuesChange={(_, values) => {
          if (values['password'] && values['new-password']) {
            // password changed verify new password
            form.validateFields(['new-password'])
          }

          ref.current?.check(values)
        }}
      >
        <CustomFormItem.Email
          ref={ref}
          key="email"
          name="email"
          className="authing-g2-input-form"
          validateFirst={true}
          form={form}
          checkRepeat={true}
          required={true}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email"
            size="large"
            placeholder={t('login.inputEmail')}
            // prefix={<UserOutlined style={{ color: '#878A95' }} />}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Email>
        <CustomFormItem.Password
          key="password"
          name="password"
          className="authing-g2-input-form"
          validateFirst={true}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
        <CustomFormItem.Password
          key="new-password"
          name="new-password"
          rules={[
            {
              validateTrigger: 'onBlur',
              validator: (_, value) => {
                if (value !== form.getFieldValue('password')) {
                  return Promise.reject(t('common.repeatPasswordDoc'))
                } else {
                  return Promise.resolve()
                }
              },
            },
          ]}
          className="authing-g2-input-form"
          validateFirst={true}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('common.passwordAgain')}
            // prefix={<LockOutlined style={{ color: '#878A95' }} />}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
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
