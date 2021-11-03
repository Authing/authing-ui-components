import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Form, Input } from 'antd'
import { LoginMethods } from '../../'
import { ErrorCode } from '../../_utils/GuardErrorCode'
import { useAuthClient } from '../../Guard/authClient'
import SubmitButton from '../../SubmitButton'
import { fieldRequiredRule } from '../../_utils'

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
  const { t } = useTranslation()
  let submitButtonRef = useRef<any>(null)

  const [showCaptcha, setShowCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState('')
  const captchaUrl = `${props.host}/api/v2/security/captcha`
  const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

  const onFinish = async (values: any) => {
    // onBeforeLogin
    submitButtonRef.current.onSpin(true)
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
      submitButtonRef.current.onSpin(false)
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
    } catch (error: any) {
      if (typeof error?.message === 'string') {
        let e = { code: 2333, data: {}, message: t('common.timeoutLDAP') }
        try {
          e = JSON.parse(error?.message)
          console.log('paser error.message error，cheke error', error)
          // onFail && onFail(errorData)
          submitButtonRef.current.onSpin(false)
          return
        } catch {}
        if (e.code === ErrorCode.INPUT_CAPTCHACODE) {
          setVerifyCodeUrl(getCaptchaUrl())
          setShowCaptcha(true)
        }
        submitButtonRef.current.onSpin(false)
        props.onLogin(e.code, e.data, e.message)
        // onFail && onFail(error)
      }
    }
  }

  return (
    <div className="authing-g2-login-ldap">
      <Form
        name="passworLogin"
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        autoComplete="off"
      >
        <Form.Item
          className="authing-g2-input-form"
          name="account"
          rules={fieldRequiredRule(t('common.account'))}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email,username,tel"
            size="large"
            placeholder={t('login.inputLdapUsername')}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="password"
          rules={fieldRequiredRule(t('common.password'))}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputLdapPwd')}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
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
