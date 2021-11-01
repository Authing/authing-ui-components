import React, { useRef, useState } from 'react'
import { Form, Input } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

import { useGuardHttp } from '../../_utils/guradHttp'
import { useAuthClient } from '../../Guard/authClient'
import { getUserRegisterParams } from '../../_utils'
import { ErrorCode } from '../../_utils/GuardErrorCode'
import { LoginMethods } from '../../'
import SubmitButton from '../../SubmitButton'
import { useTranslation } from 'react-i18next'

// core 代码只完成核心功能，东西尽可能少
interface LoginWithPasswordProps {
  // configs
  publicKey: string
  autoRegister?: boolean
  host?: string

  // events
  onLogin: any
  onBeforeLogin: any
}

export const LoginWithPassword = (props: LoginWithPasswordProps) => {
  let { post } = useGuardHttp()
  let client = useAuthClient()
  const { t } = useTranslation()
  let submitButtonRef = useRef<any>(null)

  const [showCaptcha, setShowCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState('')
  const [remainCount, setRemainCount] = useState(0)

  const captchaUrl = `${props.host}/api/v2/security/captcha`
  const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

  const encrypt = client.options.encryptFunction

  const onFinish = async (values: any) => {
    setRemainCount(0)
    // onBeforeLogin
    submitButtonRef.current.onSpin(true)
    let loginInfo = {
      type: LoginMethods.Password,
      data: {
        identity: values.account,
        password: values.password,
        captchaCode: values.captchaCode,
      },
    }
    let context = await props.onBeforeLogin(loginInfo)
    if (!context) {
      submitButtonRef.current.onSpin(false)
      return
    }

    // onLogin
    let url = '/api/v2/login/account'
    let account = values.account && values.account.trim()
    let password = values.password && values.password.trim()
    let captchaCode = values.captchaCode && values.captchaCode.trim()

    let body = {
      account: account,
      password: await encrypt!(password, props.publicKey),
      captchaCode,
      customData: getUserRegisterParams(),
      autoRegister: props.autoRegister,
    }
    const { code, message, data } = await post(url, body)

    if (code === ErrorCode.INPUT_CAPTCHACODE) {
      setVerifyCodeUrl(getCaptchaUrl())
      setShowCaptcha(true)
    }
    if (code === ErrorCode.PASSWORD_ERROR) {
      if ((data as any)?.remainCount) {
        setRemainCount((data as any)?.remainCount ?? 0)
      }
    }
    // if (Object.values(ErrorCode).includes(code)) {
    //   setButtonContent('error')
    // }
    submitButtonRef.current.onSpin(false)
    props.onLogin(code, data, message)
  }

  return (
    <div className="authing-g2-login-password">
      <Form
        name="passworLogin"
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        autoComplete="off"
      >
        <Form.Item
          name="account"
          className="authing-g2-input-form"
          rules={[{ required: true, message: '账号不能为空' }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email,username,tel"
            size="large"
            placeholder={'请输入用户名 / 手机号 / 邮箱'}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          className="authing-g2-input-form"
          rules={[{ required: true, message: '密码不能为空' }]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={'输入登录密码'}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        {/* 图形验证码 */}
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
        {remainCount !== 0 && (
          <span
            style={{
              marginBottom: 23,
              fontSize: 12,
              color: '#E63333',
              display: 'block',
            }}
          >
            {t('common.loginFailCheck', {
              number: remainCount,
            })}
          </span>
        )}

        {/* <img src={captchaUrl} alt="" /> */}
        <Form.Item>
          <SubmitButton
            text={props.autoRegister ? '登录 / 注册' : '登录'}
            className="password"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
