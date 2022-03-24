import { Form, Input, message } from 'antd'
import { LoginMethods } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Agreement } from '../../AuthingGuard/api'
import { useGuardAuthClient } from '../../Guard/authClient'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
import { Agreements } from '../../Register/components/Agreements'
import SubmitButton from '../../SubmitButton'
import { fieldRequiredRule } from '../../_utils'
import { useGuardHttpClient, useGuardPublicConfig } from '../../_utils/context'

interface LoginWithADProps {
  // configs
  publicKey: string
  autoRegister?: boolean
  // host?: string

  // events
  onLogin: any
  onBeforeLogin: any
  agreements: Agreement[]
}

export const LoginWithAD = (props: LoginWithADProps) => {
  const { agreements } = props

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  const publicConfig = useGuardPublicConfig()

  const { responseIntercept } = useGuardHttpClient()

  const { t } = useTranslation()

  let client = useGuardAuthClient()

  let submitButtonRef = useRef<any>(null)

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
      type: LoginMethods.AD,
      data: {
        identity: values.account,
        password: values.password,
      },
    }
    let context = await props.onBeforeLogin(loginInfo)
    if (!context) {
      submitButtonRef.current?.onSpin(false)
      return
    }

    // onLogin
    let account = values.account && values.account.trim()
    let password = values.password && values.password.trim()
    await client
      .loginByAd(account, password)
      .then((user) => {
        props.onLogin(200, user)
      })
      .catch((error: any) => {
        if (error.code === 'ECONNABORTED') {
          message.error(t('common.timeoutAD'))
        } else {
          submitButtonRef.current?.onError()
          let parsedMessage: any = {}
          try {
            parsedMessage = JSON.parse(error.message) || error
          } catch {
            console.log('message 解析失败')
          }
          const { code, statusCode, apiCode, message, data } = parsedMessage
          const { onGuardHandling } = responseIntercept({
            statusCode: statusCode || code,
            apiCode,
            data,
            message,
            code,
          })
          console.log(parsedMessage, error)
          onGuardHandling?.()
        }
      })
      .finally(() => {
        submitButtonRef.current?.onSpin(false)
      })
  }

  return (
    <div className="authing-g2-login-ad">
      <Form
        name="adLogin"
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        autoComplete="off"
      >
        {publicConfig?.ssoPageComponentDisplay.userPasswordInput && (
          <>
            <Form.Item
              className="authing-g2-input-form"
              name="account"
              validateTrigger={['onBlur', 'onChange']}
              rules={fieldRequiredRule(t('common.account'))}
            >
              <Input
                className="authing-g2-input"
                autoComplete="off"
                size="large"
                placeholder={t('login.inputAdUsername')}
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
                autoComplete="off"
                className="authing-g2-input"
                size="large"
                placeholder={t('login.inputAdPwd')}
                prefix={
                  <IconFont
                    type="authing-a-lock-line1"
                    style={{ color: '#878A95' }}
                  />
                }
              />
            </Form.Item>
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
          </>
        )}
      </Form>
    </div>
  )
}
