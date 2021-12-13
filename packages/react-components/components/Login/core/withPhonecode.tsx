import React, { useRef } from 'react'
import { Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAuthClient } from '../../Guard/authClient'
import { LoginMethods } from '../../'
import { SendCode } from '../../SendCode'
import { fieldRequiredRule } from '../../_utils'
import SubmitButton from '../../SubmitButton'
import { InputNumber } from '../../InputNumber'
import CustomFormItem from '../../ValidatorRules'
import { IconFont } from '../../IconFont'

// const formatPhone = (value: any) => {
//   if (!value) {
//     return ''
//   }
//   let a = value.slice(0, 3)
//   let b = value.slice(3, 7)
//   let c = value.slice(7, 11)
//   if (value.length < 4) {
//     return a
//   } else if (value.length < 8) {
//     return `${a}-${b}`
//   } else {
//     return `${a}-${b}-${c}`
//   }
// }
export const LoginWithPhoneCode = (props: any) => {
  let [form] = Form.useForm()
  let submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()

  let client = useAuthClient()

  const verifyCodeLength = props.verifyCodeLength ?? 4

  const onFinish = async (values: any) => {
    submitButtonRef.current.onSpin(true)
    // onBeforeLogin
    let loginInfo = {
      type: LoginMethods.Password,
      data: {
        phone: values.phone,
        code: values.code,
      },
    }
    let context = await props.onBeforeLogin(loginInfo)
    if (!context) {
      submitButtonRef.current.onSpin(false)
      return
    }

    let loginContext = client.loginByPhoneCode(values.phone, values.code)
    loginContext
      .then((u) => {
        submitButtonRef.current.onSpin(false)
        props.onLogin(200, u)
      })
      .catch((e) => {
        submitButtonRef.current.onError()
        props.onLogin(e.code, e.data, e.message)
      })
      .finally(() => {
        submitButtonRef.current.onSpin(false)
      })
  }

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="phoneCode"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        autoComplete="off"
      >
        <CustomFormItem.Phone
          className="authing-g2-input-form"
          name="phone"
          required={true}
        >
          <InputNumber
            className="authing-g2-input"
            autoComplete="tel"
            type="tel"
            size="large"
            // 只有 InputNumber formatter、controls API
            maxLength={11}
            // formatter={formatPhone}
            // parser={(value) => (value ? value.replaceAll('-', '') : '')}
            placeholder={t('login.inputPhone')}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Phone>
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="code"
          rules={fieldRequiredRule(t('common.captchaCode'))}
        >
          <SendCode
            className="authing-g2-input"
            autoComplete="one-time-code"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            maxLength={verifyCodeLength}
            autoSubmit={true}
            // prefix={<SafetyOutlined style={{ color: '#878A95' }} />}
            prefix={
              <IconFont
                type="authing-a-shield-check-line1"
                style={{ color: '#878A95' }}
              />
            }
            method="phone"
            data={''}
            form={form}
            onSendCodeBefore={() => form.validateFields(['phone'])}
          />
        </Form.Item>
        <Form.Item>
          <SubmitButton
            text={
              props.autoRegister
                ? `${t('common.login')} / ${t('common.register')}`
                : t('common.login')
            }
            className="password"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
