import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input } from 'antd'
import { StoreValue } from 'antd/lib/form/interface'
import { SendCode } from '../../SendCode'
import { useAuthClient } from '../../Guard/authClient'
import { fieldRequiredRule, validate } from '../../_utils'
import SubmitButton from '../../SubmitButton'
import CustomFormItem from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
interface ResetPasswordProps {
  onReset: any
  publicConfig: any
  onSend: (type: 'email' | 'phone') => void
  onSendError: (type: 'email' | 'phone', error: any) => void
}
export const ResetPassword = (props: ResetPasswordProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let [identify, setIdentify] = useState('')
  let [codeMethod, setCodeMethod] = useState<'phone' | 'email'>('phone')
  let client = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  const verifyCodeLength = props.publicConfig.verifyCodeLength ?? 4

  const onFinish = async (values: any) => {
    let identify = values.identify
    let code = values.code
    let newPassword = values.password
    let context = new Promise(() => {})

    if (codeMethod === 'email') {
      context = client.resetPasswordByEmailCode(identify, code, newPassword)
    }
    if (codeMethod === 'phone') {
      context = client.resetPasswordByPhoneCode(identify, code, newPassword)
    }

    context
      .then((r) => {
        props.onSend(codeMethod)
        props.onReset(r)
      })
      .catch((e) => {
        submitButtonRef.current.onError()
        props.onSendError(codeMethod, e)
        props.onReset(e)
      })
  }

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="resetPassword"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => {
          submitButtonRef?.current?.onError()
        }}
        autoComplete="off"
      >
        <Form.Item
          className="authing-g2-input-form"
          name="identify"
          validateFirst={true}
          rules={[
            ...fieldRequiredRule(t('common.account')),
            {
              validator: async (_, value: StoreValue) => {
                if (!value) {
                  return
                }
                if (validate('email', value) || validate('phone', value)) {
                  return
                } else {
                  throw new Error(t('login.inputCorrectPhoneOrEmail'))
                }
              },
            },
          ]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={t('login.inputPhoneOrEmail')}
            value={identify}
            onChange={(e) => {
              let v = e.target.value
              setIdentify(v)
              if (validate('email', v)) {
                setCodeMethod('email')
              }
              if (validate('phone', v)) {
                setCodeMethod('phone')
              }
            }}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="code"
          rules={[...fieldRequiredRule(t('common.captchaCode'))]}
        >
          <SendCode
            className="authing-g2-input"
            autoComplete="one-time-code"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            prefix={
              <IconFont
                type="authing-a-shield-check-line1"
                style={{ color: '#878A95' }}
              />
            }
            maxLength={verifyCodeLength}
            method={codeMethod}
            data={identify}
            onSendCodeBefore={async () => {
              await form.validateFields(['identify'])
            }}

            // form={form}
          />
        </Form.Item>
        <CustomFormItem.Password
          className="authing-g2-input-form"
          name="password"
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('user.inputNewPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
        <Form.Item className="authing-g2-input-form submit-form">
          <SubmitButton
            className="forget-password"
            text={t('common.confirm')}
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
