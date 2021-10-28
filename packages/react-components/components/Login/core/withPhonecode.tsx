import React from 'react'
import { Button, Form, Input } from 'antd'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons'
import { LoginMethods } from '../../'
import { SendCode } from '../../SendCode'
import { useTranslation } from 'react-i18next'
import { validate } from '../../_utils'
import { StoreValue } from 'antd/lib/form/interface'

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
          rules={[
            { required: true, message: t('login.inputPhone') },
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
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={t('login.inputPhone')}
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
            onSendCodeBefore={() => form.validateFields(['phone'])}
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
