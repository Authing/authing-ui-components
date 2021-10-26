import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Form, Input } from 'antd'
import { StoreValue } from 'antd/lib/form/interface'

import { UserOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons'
import { SendCode } from 'src/components/SendCode'

import { useAuthClient } from '../../Guard/authClient'
import { validate } from 'src/utils'
import SubmitButton from 'src/components/SubmitButton'

export const ResetPassword = (props: any) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let [identify, setIdentify] = useState('')
  let [codeMethod, setCodeMethod] = useState<'phone' | 'email'>('phone')
  let client = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    let identify = values.identify
    let code = values.code
    let newPassword = values.password
    let context = new Promise(() => {})

    if (codeMethod === 'email') {
      // let r = await
      context = client.resetPasswordByEmailCode(identify, code, newPassword)
    }
    if (codeMethod === 'phone') {
      context = client.resetPasswordByPhoneCode(identify, code, newPassword)
    }

    context
      .then((r) => {
        props.onReset(r)
      })
      .catch((e) => {
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
          rules={[
            { required: true, message: t('login.inputPhoneOrEmail') },
            {
              validator: async (_, value: StoreValue) => {
                if (!value) {
                  return
                }
                if (validate('email', value) || validate('phone', value)) {
                  return
                } else {
                  throw new Error(t('login.inputCorrectPhone'))
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
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="code"
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          <SendCode
            className="authing-g2-input"
            autoComplete="one-time-code"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: 4,
            })}
            prefix={<SafetyOutlined style={{ color: '#878A95' }} />}
            method={codeMethod}
            data={identify}
            // form={form}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="password"
          rules={[
            {
              required: true,
              message: '至少六位，需包含英文、数字、符号中的两种',
            },
          ]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={'输入新密码'}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
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
