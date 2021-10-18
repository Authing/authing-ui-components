import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, Input, message } from 'antd'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons'
import { validate } from 'src/utils'

const SendCodeButton = (props: any) => {
  const [countDown, setCountDown] = useState(0)
  const [sending, setSending] = useState(false)

  let clsSending = sending === true && 'sending'
  const timerRef = useRef<any>(0)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (countDown <= 0) {
      clearInterval(timerRef.current)
      setSending(false)
    }
  }, [countDown])

  return (
    <div
      className={`authing-g2-send-code ${clsSending}`}
      onClick={() => {
        let phone = props.form.getFieldValue('phone')
        if (!validate('phone', phone)) {
          message.error('请输入正确的手机号！')
          return
        }
        if (sending === false) {
          setCountDown(60)
          timerRef.current = setInterval(() => {
            setCountDown((per) => {
              return per - 1
            })
          }, 1000)
          setSending(true)
          props.onSendCode()
        }
      }}
    >
      {sending ? `${countDown} 秒后重试` : '发送验证码'}
    </div>
  )
}

export const LoginWithPhoneCode = (props: any) => {
  let [form] = Form.useForm()
  let client = useAuthClient()

  const onSendCode = async () => {
    let phone = form.getFieldValue('phone')

    try {
      await client.sendSmsCode(phone)
    } catch (error) {
      console.log('发送验证码失败', error)
    }
  }

  const onFinish = async (values: any) => {
    let u = await client.loginByPhoneCode(values.phone, values.code)
    // console.log('u', u) // u 就是这个信息
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
          name="phone"
          rules={[{ required: true, message: '请输入手机号' }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={'请输入手机号'}
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item
          name="code"
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          <Input
            className="authing-g2-input"
            size="large"
            placeholder={'请输入验证码'}
            prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
            suffix={<SendCodeButton form={form} onSendCode={onSendCode} />}
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
