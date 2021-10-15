import React, { useState } from 'react'
import { Button, Form, Input } from 'antd'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons'
import { validate } from 'src/utils'

export const LoginWithPhoneCode = (props: any) => {
  let [form] = Form.useForm()
  let client = useAuthClient()

  const onSendCode = async () => {
    let phone = form.getFieldValue('phone')
    if (!validate('phone', phone)) {
      console.log('手机号格式不正确')
      return
    }
    try {
      await client.sendSmsCode(phone)
    } catch (error) {
      console.log('发送验证码失败', error)
    }
  }

  const onFinish = async (values: any) => {
    let u = await client.loginByPhoneCode(values.phone, values.code)
    // u 就是这个信息
    console.log('u', u)
    props.onLogin()
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
        <Form.Item name="phone">
          <Input
            autoComplete="tel"
            size="large"
            placeholder={'请输入手机号'}
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item name="code">
          <Input
            size="large"
            placeholder={'请输入验证码'}
            prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
            suffix={
              <div
                className="authing-g2-send-code"
                onClick={() => onSendCode()}
              >
                发送验证码
              </div>
            }
          />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="authing-g2-login-button phone-code"
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
