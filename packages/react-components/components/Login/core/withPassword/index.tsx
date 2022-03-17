import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { useGuardHttp } from '../../../_utils/guardHttp'
import { useGuardAuthClient } from '../../../Guard/authClient'
import { fieldRequiredRule, getUserRegisterParams } from '../../../_utils'
import { ErrorCode } from '../../../_utils/GuardErrorCode'
import SubmitButton from '../../../SubmitButton'
import { Agreement, PasswordLoginMethods } from '../../../AuthingGuard/api'
import { LoginMethods } from '../../..'
import { FormItemAccount } from './FormItemAccount'
import { InputAccount } from './InputAccount'
import { GraphicVerifyCode } from './GraphicVerifyCode'
import { IconFont } from '../../../IconFont'
import { InputPassword } from '../../../InputPassword'
import { Agreements } from '../../../Register/components/Agreements'
import { AuthingGuardResponse, AuthingResponse } from '../../../_utils/http'

interface LoginWithPasswordProps {
  // configs
  publicKey: string
  autoRegister?: boolean
  host?: string

  // events
  onLogin: any
  onBeforeLogin?: any
  // 越过 login 正常的请求，返回一个 res
  onLoginRequest?: (loginInfo: any) => Promise<AuthingResponse>
  passwordLoginMethods: PasswordLoginMethods[]

  agreements: Agreement[]
  loginWay?: LoginMethods
  submitButText?: string
}

export const LoginWithPassword = (props: LoginWithPasswordProps) => {
  const { agreements } = props
  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  let { t } = useTranslation()
  let { post } = useGuardHttp()
  let client = useGuardAuthClient()

  let submitButtonRef = useRef<any>(null)

  const [showCaptcha, setShowCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState('')
  const [remainCount, setRemainCount] = useState(0)
  const [accountLock, setAccountLock] = useState(false)
  const getCaptchaUrl = () => {
    const url = new URL(props.host!)
    url.pathname = '/api/v2/security/captcha'
    url.search = `?r=${+new Date()}`
    return url.href
  }

  const encrypt = client.options.encryptFunction

  const loginRequest = useCallback(
    async (loginInfo: any): Promise<AuthingGuardResponse> => {
      if (!!props.onLoginRequest) {
        const res = await props.onLoginRequest(loginInfo)

        return res
      }

      // onLogin
      const { data: loginData } = loginInfo
      let url = '/api/v2/login/account'
      let account = loginData.identity && loginData.identity.trim()
      let password = loginData.password && loginData.password.trim()
      let captchaCode = loginData.captchaCode && loginData.captchaCode.trim()

      let body = {
        account: account,
        password: await encrypt!(password, props.publicKey),
        captchaCode,
        customData: getUserRegisterParams(),
        autoRegister: props.autoRegister,
        withCustomData: true,
      }
      const res = await post(url, body)

      return res
    },
    [encrypt, post, props]
  )

  const onFinish = async (values: any) => {
    setValidated(true)
    if (agreements?.length && !acceptedAgreements) {
      submitButtonRef.current.onError()

      return
    }
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
    let context = await props.onBeforeLogin?.(loginInfo)
    if (!context && !!props.onBeforeLogin) {
      submitButtonRef?.current.onSpin(false)
      return
    }

    const res = await loginRequest(loginInfo)

    onLoginRes(res)
  }

  const onLoginRes = (res: AuthingGuardResponse) => {
    const { code, message: msg, data, onGuardHandling } = res

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
        submitButtonRef?.current.onSpin(false)
        // TODO 临时拦截密码错误限制不报 message
        props.onLogin(9999, data, msg)
        return
      }
    }

    if (
      code === ErrorCode.ACCOUNT_LOCK ||
      code === ErrorCode.MULTIPLE_ERROR_LOCK
    ) {
      // 账号锁定
      setAccountLock(true)
    }

    submitButtonRef?.current.onSpin(false)

    if (code === 200) {
      props.onLogin(200, data, msg)
    } else {
      onGuardHandling?.()
    }
  }

  useEffect(() => {
    setRemainCount(0)
    setAccountLock(false)
  }, [props.loginWay])

  const submitText = useMemo(() => {
    if (props.submitButText) return props.submitButText

    return props.autoRegister
      ? `${t('common.login')} / ${t('common.register')}`
      : t('common.login')
  }, [props, t])

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
            autoComplete="off"
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
        {remainCount !== 0 && !accountLock && (
          <span
            style={{
              marginBottom: 23,
              fontSize: 12,
              color: '#E8353E',
              display: 'block',
            }}
          >
            {t('common.loginFailCheck', {
              number: remainCount,
            })}
          </span>
        )}
        {accountLock && (
          <span
            style={{
              marginBottom: 23,
              fontSize: 12,
              color: '#E8353E',
              display: 'block',
            }}
          >
            {t('common.accountLock')}
          </span>
        )}

        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
        <Form.Item>
          <SubmitButton
            text={submitText}
            className="password"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
