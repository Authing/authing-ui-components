import React, { useRef, useState } from 'react'
import { Form, Input } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

import { useGuardHttp } from '../../_utils/guradHttp'
import { useAuthClient } from '../../Guard/authClient'
import { getUserRegisterParams } from '../../_utils'
import { ErrorCode } from '../../_utils/GuardErrorCode'
import { LoginMethods } from '../../'
import SubmitButton from '../../SubmitButton'

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
  let { t } = useTranslation()
  let { post } = useGuardHttp()
  let client = useAuthClient()

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
          rules={[{ required: true, message: t('common.accNotNull') }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email,username,tel"
            size="large"
            placeholder={`${t('login.inputUsername')} / ${t(
              'common.phoneNumber'
            )} / ${t('common.email')}`}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          className="authing-g2-input-form"
          rules={[{ required: true, message: t('common.passwordNotNull') }]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputLoginPwd')}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        {/* 图形验证码 */}
        {showCaptcha && (
          <Form.Item
            className="authing-g2-input-form"
            name="captchaCode"
            rules={[{ required: true, message: t('login.inputCaptchaCode') }]}
          >
            <Input
              className="authing-g2-input add-after"
              size="large"
              placeholder={t('login.inputCaptchaCode')}
              addonAfter={
                <img
                  className="g2-captcha-code-image"
                  src={verifyCodeUrl}
                  alt={t('login.captchaCode')}
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
