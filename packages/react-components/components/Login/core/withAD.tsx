import { Form, Input, message } from 'antd'
import { LoginMethods } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Agreement } from '../../AuthingGuard/api'
// import { useGuardAuthClient } from '../../Guard/authClient'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
import { Agreements } from '../../Register/components/Agreements'
import SubmitButton from '../../SubmitButton'
import version from '../../version/version'
import { fieldRequiredRule } from '../../_utils'
import {
  useGuardAppId,
  useGuardFinallyConfig,
  useGuardHttpClient,
  useGuardPublicConfig,
} from '../../_utils/context'
import { requestClient } from '../../_utils/http'
import { i18n } from '../../_utils/locales'
import { CodeAction } from '../../_utils/responseManagement/interface'

interface LoginWithADProps {
  // configs
  publicKey: string
  autoRegister?: boolean
  // host?: string

  // events
  // onLogin: any
  onLoginSuccess: any
  onLoginFailed: any
  onBeforeLogin: any
  agreements: Agreement[]
}

export const LoginWithAD = (props: LoginWithADProps) => {
  const { agreements, onLoginFailed, onLoginSuccess } = props

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  const publicConfig = useGuardPublicConfig()

  const appId = useGuardAppId()

  const { responseIntercept } = useGuardHttpClient()

  const config = useGuardFinallyConfig()

  const { t } = useTranslation()

  // let client = useGuardAuthClient()

  // const { post } = useGuardHttpClient()

  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    setValidated(true)
    if (agreements?.length && !acceptedAgreements) {
      submitButtonRef.current?.onError()
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
    let username = values.account && values.account.trim()
    let password = values.password && values.password.trim()

    // todo
    try {
      const firstLevelDomain = new URL(config.host).hostname
        .split('.')
        .slice(1)
        .join('.')
      console.log(firstLevelDomain)
      const websocketHost = `https://ws.${firstLevelDomain}`

      const api = `${websocketHost}/api/v2/ad/verify-user`

      const fetchRes = await fetch(api, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [requestClient.langHeader]: i18n.language,
          'x-authing-userpool-id': publicConfig.userPoolId,
          'x-authing-app-id': appId,
          'x-authing-sdk-version': version,
          'x-authing-request-from': `Guard@${version}`,
        },
      })

      const res = await fetchRes.json()

      const { code, data, onGuardHandling } = responseIntercept(res)

      submitButtonRef.current?.onSpin(false)

      if (code === 200) {
        onLoginSuccess(data)
      } else {
        const handMode = onGuardHandling?.()
        // 向上层抛出错误
        handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)
      }
    } catch (error: any) {
      submitButtonRef.current?.onSpin(false)
      if (error.code === 'ECONNABORTED') {
        message.error(t('common.timeoutAD'))
        onLoginFailed(2333, {})
      }
      console.log(error)
    }

    // await client
    //   .loginByAd(account, password)
    //   .then((user) => {
    //     // props.onLogin(200, user)
    //     onLoginSuccess(user)
    //   })
    //   .catch((error: any) => {
    //     if (error.code === 'ECONNABORTED') {
    //       message.error(t('common.timeoutAD'))
    //       onLoginFailed(2333, {})
    //     } else {
    //       submitButtonRef.current?.onError()
    //       let parsedMessage: any = {}
    //       try {
    //         parsedMessage = JSON.parse(error.message) || error
    //       } catch {
    //         console.log('message 解析失败')
    //       }
    //       const { code, statusCode, apiCode, message, data } = parsedMessage
    //       // TODO 错误信息返回不符合 AuthingResponse 的格式 暂用 code 替代
    //       const { onGuardHandling } = responseIntercept({
    //         statusCode: statusCode || code,
    //         apiCode,
    //         data,
    //         message,
    //         code,
    //       })

    //       const handMode = onGuardHandling?.()
    //       // 向上层抛出错误
    //       handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)
    //     }
    //   })
    //   .finally(() => {
    //     submitButtonRef.current?.onSpin(false)
    //   })
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
