import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, message } from 'antd'
import { LoginMethods } from '../../'
import { ErrorCode } from '../../_utils/GuardErrorCode'
import { useGuardAuthClient } from '../../Guard/authClient'
import SubmitButton from '../../SubmitButton'
import { fieldRequiredRule } from '../../_utils'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
import { Agreements } from '../../Register/components/Agreements'
import { Agreement } from '../../AuthingGuard/api'
import { useGuardHttpClient } from '../../_utils/context'
import { CodeAction } from '../../_utils/responseManagement/interface'
interface LoginWithLDAPProps {
  // configs
  publicKey: string
  autoRegister?: boolean
  host?: string

  // events
  // onLogin: any
  onLoginSuccess: any
  onLoginFailed: any
  onBeforeLogin: any
  agreements: Agreement[]
}

export const LoginWithLDAP = (props: LoginWithLDAPProps) => {
  const { agreements, onLoginSuccess, onLoginFailed } = props

  const { responseIntercept } = useGuardHttpClient()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)
  // let client = useGuardAuthClient()
  const { post } = useGuardHttpClient()
  const { t } = useTranslation()
  let submitButtonRef = useRef<any>(null)

  const [showCaptcha, setShowCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState('')
  const captchaUrl = `${props.host}/api/v2/security/captcha`
  const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

  const onFinish = async (values: any) => {
    setValidated(true)
    if (agreements?.length && !acceptedAgreements) {
      // message.error(t('common.loginProtocolTips'))

      submitButtonRef.current?.onError()
      // submitButtonRef.current.onSpin(false)
      return
    }
    // onBeforeLogin
    submitButtonRef.current?.onSpin(true)
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
      submitButtonRef.current?.onSpin(false)
      return
    }

    // onLogin
    let username = values.account && values.account.trim()
    let password = values.password && values.password.trim()

    const { code, data, onGuardHandling } = await post(
      '/api/v2/ldap/verify-user',
      {
        username,
        password,
      }
    )

    submitButtonRef.current.onSpin(false)

    if (code === 200) {
      onLoginSuccess(data)
    } else {
      submitButtonRef.current.onError()
      if (code === ErrorCode.INPUT_CAPTCHACODE) {
        setVerifyCodeUrl(getCaptchaUrl())
        setShowCaptcha(true)
      }
      const handMode = onGuardHandling?.()
      // 向上层抛出错误
      handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)
    }

    // let captchaCode = values.captchaCode && values.captchaCode.trim()
    // await client
    // .loginByLdap(account, password)
    // .then((user) => {
    //   onLoginSuccess(user)
    // })
    // .catch((error: any) => {
    //   if (error.code === 'ECONNABORTED') {
    //     message.error(t('common.timeoutLDAP'))
    //     onLoginFailed(2333, {})
    //   } else {
    //     submitButtonRef.current?.onError()
    //     let parsedMessage: any = {}
    //     try {
    //       parsedMessage = JSON.parse(error.message) || error
    //     } catch {
    //       console.log('message 解析失败')
    //     }
    //     const { code, statusCode, apiCode, message, data } = parsedMessage
    //     if (code === ErrorCode.INPUT_CAPTCHACODE) {
    //       setVerifyCodeUrl(getCaptchaUrl())
    //       setShowCaptcha(true)
    //     }
    //     // TODO 错误信息返回不符合 AuthingResponse 的格式 暂用 code 替代
    //     const { onGuardHandling } = responseIntercept({
    //       statusCode: statusCode || code,
    //       apiCode,
    //       data,
    //       message,
    //       code,
    //     })
    //     const handMode = onGuardHandling?.()
    //     // 向上层抛出错误
    //     handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)
    //   }
    // })
    // .finally(() => {
    //   submitButtonRef.current?.onSpin(false)
    // })
  }

  return (
    <div className="authing-g2-login-ldap">
      <Form
        name="passworLogin"
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current?.onError()}
        autoComplete="off"
      >
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="account"
          rules={fieldRequiredRule(t('common.account'))}
        >
          <Input
            className="authing-g2-input"
            autoComplete="off"
            size="large"
            placeholder={t('login.inputLdapUsername')}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="password"
          rules={fieldRequiredRule(t('common.password'))}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputLdapPwd')}
            // prefix={<LockOutlined style={{ color: '#878A95' }} />}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>
        {showCaptcha && (
          <Form.Item
            validateTrigger={['onBlur', 'onChange']}
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
        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
        <Form.Item>
          <SubmitButton
            text={t('common.login')}
            className="password"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
