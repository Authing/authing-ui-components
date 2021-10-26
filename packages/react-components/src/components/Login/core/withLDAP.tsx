import React, { useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { LoginMethods } from '../../'
import { ErrorCode } from '../../_utils/GuardErrorCode'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithLDAPProps {
  // configs
  publicKey: string
  autoRegister?: boolean
  host?: string

  // events
  onLogin: any
  onBeforeLogin: any
}

export const LoginWithLDAP = (props: LoginWithLDAPProps) => {
  let client = useAuthClient()
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState('')
  const captchaUrl = `${props.host}/api/v2/security/captcha`
  const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

  const onFinish = async (values: any) => {
    // onBeforeLogin
    let loginInfo = {
      type: LoginMethods.LDAP,
      data: {
        identity: values.account,
        password: values.password,
        captchaCode: values.captchaCode,
      },
    }
    let context = await props.onBeforeLogin(loginInfo)
    if (!context) {
      console.log('阻断执行，context：', context)
      return
    }

    // onLogin
    let account = values.account && values.account.trim()
    let password = values.password && values.password.trim()
    let captchaCode = values.captchaCode && values.captchaCode.trim()
    try {
      const user = await client.loginByLdap(account, password, {
        autoRegister: props.autoRegister,
        captchaCode,
      })
      props.onLogin(200, user)
    } catch (error) {
      if (typeof error.message === 'string') {
        let e = { code: 2333, data: {}, message: '没有拿到错误提示' }
        try {
          e = JSON.parse(error.message)
          console.log('解析 error.message 错误，检查 error', error)
          // onFail && onFail(errorData)
          return
        } catch {}
        if (e.code === ErrorCode.INPUT_CAPTCHACODE) {
          setVerifyCodeUrl(getCaptchaUrl())
          setShowCaptcha(true)
        }
        props.onLogin(e.code, e.data, e.message)
        // onFail && onFail(error)
      }
    }
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className="authing-g2-login-ldap">
      <Form
        name="passworLogin"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          className="authing-g2-input-form"
          name="account"
          rules={[{ required: true, message: '账号不能为空' }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email,username,tel"
            size="large"
            placeholder={'请输入 LDAP 账号'}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="password"
          rules={[{ required: true, message: '密码不能为空' }]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={'请输入 LDAP 密码'}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        {showCaptcha && (
          <Form.Item
            className="authing-g2-input-form"
            name="captchaCode"
            rules={[{ required: true, message: '请输入图形验证码' }]}
          >
            <Input
              className="authing-g2-input add-after"
              size="large"
              placeholder={'请输入图形验证码'}
              addonAfter={
                <img
                  className="g2-captcha-code-image"
                  src={verifyCodeUrl}
                  alt={'图形验证码'}
                  style={{ height: '2em', cursor: 'pointer' }}
                  onClick={() => setVerifyCodeUrl(getCaptchaUrl())}
                />
              }
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="authing-g2-submit-button password"
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
