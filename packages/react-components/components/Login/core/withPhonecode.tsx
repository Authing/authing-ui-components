import React, { useRef } from 'react'
import { Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { StoreValue } from 'antd/lib/form/interface'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons'
import { LoginMethods } from '../../'
import { SendCode } from '../../SendCode'
import { validate } from '../../_utils'
import SubmitButton from '../../SubmitButton'
import { InputNumber } from '../../InputNumber'

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
        submitButtonRef.current.onSpin(false)
        props.onLogin(e.code, e.data, e.message)
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
        <Form.Item
          className="authing-g2-input-form"
          name="phone"
          rules={[
            { required: true, message: t('common.phoneNotNull') },
            {
              validator: async (_, value: StoreValue) => {
                if (!value) {
                  return
                }
                if (validate('phone', value)) {
                  return
                } else {
                  throw new Error(t('common.phoneFormateError'))
                }
              },
            },
          ]}
        >
          <InputNumber
            className="authing-g2-input"
            autoComplete="tel"
            type="tel"
            size="large"
            // 只有 InputNumber formatter、controls API
            // formatter={formatPhone}
            // parser={(value) => (value ? value.replaceAll('-', '') : '')}
            placeholder={t('login.inputPhone')}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="code"
          rules={[{ required: true, message: t('common.inputVerifyCode') }]}
        >
          <SendCode
            className="authing-g2-input"
            autoComplete="one-time-code"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: 4,
            })}
            prefix={<SafetyOutlined style={{ color: '#878A95' }} />}
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
