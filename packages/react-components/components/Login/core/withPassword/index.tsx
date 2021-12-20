import React, { useRef, useState } from 'react'
import { Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { useGuardHttp } from '../../../_utils/guradHttp'
import { useGuardAuthClient } from '../../../Guard/authClient'
import { fieldRequiredRule, getUserRegisterParams } from '../../../_utils'
import { ErrorCode } from '../../../_utils/GuardErrorCode'
import SubmitButton from '../../../SubmitButton'
import { PasswordLoginMethods } from '../../../AuthingGuard/api'
import { LoginMethods } from '../../..'
import { FormItemAccount } from './FormItemAccount'
import { InputAccount } from './InputAccount'
import { GraphicVerifyCode } from './GraphicVerifyCode'
import { IconFont } from '../../../IconFont'
import { InputPassword } from '../../../InputPassword'

interface LoginWithPasswordProps {
  // configs
  publicKey: string
  autoRegister?: boolean
  host?: string

  // events
  onLogin: any
  onBeforeLogin: any
  passwordLoginMethods: PasswordLoginMethods[]
}

export const LoginWithPassword = (props: LoginWithPasswordProps) => {
  let { t } = useTranslation()
  let { post } = useGuardHttp()
  let client = useGuardAuthClient()

  let submitButtonRef = useRef<any>(null)

  const [showCaptcha, setShowCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState('')
  const [remainCount, setRemainCount] = useState(0)

  const getCaptchaUrl = () => {
    const url = new URL(props.host!)
    url.pathname = '/api/v2/security/captcha'
    url.search = `?r=${+new Date()}`
    return url.href
  }

  const encrypt = client.options.encryptFunction

  const onFinish = async (values: any) => {
    setRemainCount(0)
    // onBeforeLogin
    submitButtonRef?.current.onSpin(true)
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
      submitButtonRef?.current.onSpin(false)
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

    if (code !== 200) {
      submitButtonRef.current.onError()
    }

    if (code === ErrorCode.INPUT_CAPTCHACODE) {
      setVerifyCodeUrl(getCaptchaUrl())
      setShowCaptcha(true)
    }
    if (code === ErrorCode.PASSWORD_ERROR) {
      if ((data as any)?.remainCount) {
        setRemainCount((data as any)?.remainCount ?? 0)
      }
    }
    submitButtonRef?.current.onSpin(false)
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
        <FormItemAccount
          name="account"
          className="authing-g2-input-form"
          passwordLoginMethods={props.passwordLoginMethods}
        >
          <InputAccount
            className="authing-g2-input"
            autoComplete="email,username,tel"
            size="large"
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
            passwordLoginMethods={props.passwordLoginMethods}
          />
        </FormItemAccount>
        <Form.Item
          name="password"
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          rules={fieldRequiredRule(t('common.password'))}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputLoginPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>
        {/* 图形验证码 */}
        {showCaptcha && (
          <Form.Item
            className="authing-g2-input-form"
            validateTrigger={['onBlur', 'onChange']}
            name="captchaCode"
            rules={fieldRequiredRule(t('common.captchaCode'))}
          >
            <GraphicVerifyCode
              className="authing-g2-input"
              size="large"
              placeholder={t('login.inputCaptchaCode')}
              verifyCodeUrl={verifyCodeUrl}
              changeCode={() => setVerifyCodeUrl(getCaptchaUrl())}
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
