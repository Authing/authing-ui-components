import React from 'react'
import { Button, Form, Input } from 'antd'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons'
import { LoginMethods } from 'src/components'
import { SendCode } from 'src/components/SendCode'
import { useTranslation } from 'react-i18next'

export const LoginWithPhoneCode = (props: any) => {
  let [form] = Form.useForm()
  const { t } = useTranslation()

  let client = useAuthClient()

  const onFinish = async (values: any) => {
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
      return
    }

    let u = await client.loginByPhoneCode(values.phone, values.code)
    props.onLogin(200, u)
  }

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="phoneCode"
        form={form}
        // initialValues={{ remember: true }}
        onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          className="authing-g2-input-form"
          name="phone"
          rules={[{ required: true, message: '请输入手机号' }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={'请输入手机号'}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="code"
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          {/* <Input
            className="authing-g2-input"
            size="large"
            placeholder={'请输入验证码'}
            prefix={<SafetyOutlined style={{ color: '#878A95' }} />}
            suffix={<SendCodeButton form={form} onSendCode={onSendCode} />}
          /> */}
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
            // placeholder={'请输入验证码'}
          />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="authing-g2-submit-button phone-code"
          >
            {props.autoRegister ? '登录 / 注册' : '登录'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
