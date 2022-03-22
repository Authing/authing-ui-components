import { Button, message, Space, Tooltip } from 'antd'
import { SocialConnectionProvider, RelayMethodEnum } from 'authing-js-sdk'
import { Lang } from 'authing-js-sdk/build/main/types'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { i18n } from '../../_utils/locales'
import { isLarkBrowser, isWechatBrowser } from '../../_utils'
import querystring from 'query-string'
import { ApplicationConfig, SocialConnectionItem } from '../../AuthingGuard/api'
import { APP_MFA_CODE, OTP_MFA_CODE } from '../../AuthingGuard/constants'
import { useScreenSize } from '../../AuthingGuard/hooks/useScreenSize'
import { useGuardAuthClient } from '../../Guard/authClient'
import { IconFont } from '../../IconFont'
import { LoginConfig } from '../interface'
import './style.less'
import { useMediaSize } from '../../_utils/hooks'
import { IdpButton } from './IdpButton'

export interface SocialLoginProps {
  appId: string
  config: LoginConfig
  onLogin: any
  enterpriseConnectionObjs: ApplicationConfig['identityProviders']
  socialConnectionObjs: SocialConnectionItem[]
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  appId,
  config,
  onLogin: onGuardLogin,
  enterpriseConnectionObjs,
  socialConnectionObjs,
}) => {
  const noLoginMethods = !config.loginMethods.length

  const userPoolId = config.__publicConfig__?.userPoolId

  const publicConfig = config.__publicConfig__

  const { t } = useTranslation()

  const [screenSize] = useScreenSize()

  const authClient = useGuardAuthClient()

  const { isPhoneMedia } = useMediaSize()

  useEffect(() => {
    const onMessage = (evt: MessageEvent) => {
      // TODO: event.origin是指发送的消息源，一定要进行验证！！！
      const { code, message: errMsg, data, event } = evt.data

      const { source, eventType } = event || {}
      // 社会化登录是用 authing-js-sdk 实现的，不用再在这里回调了
      if (source === 'authing' && eventType === 'socialLogin') {
        return
      }
      try {
        const parsedMsg = JSON.parse(errMsg)

        const {
          code: authingCode,
          message: authingMessage,
          data: authingData,
        } = parsedMsg

        if ([OTP_MFA_CODE, APP_MFA_CODE].includes(authingCode)) {
          onGuardLogin(authingCode, authingData, authingMessage)
          return
        }
      } catch (e) {
        // do nothing...
      }

      if (code !== undefined) {
        if (code === 200) {
          localStorage.setItem('_authing_token', data?.token)
          //   onSuccess(data)
          onGuardLogin(code, data, message)

          // TODO 身份源绑定逻辑 临时修改
        } else if ([1641, 1640].includes(code)) {
          onGuardLogin(code, data)
        } else {
          try {
            const parsedMsg = JSON.parse(errMsg)
            const { message: errorMessage } = parsedMsg
            message.error(errorMessage)
          } catch (err) {
            message.error(errMsg)
          }
        }
      }
    }

    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [onGuardLogin])

  const idpButtons = enterpriseConnectionObjs.map((i: any) => {
    return (
      <IdpButton
        key={i.identifier}
        i={i}
        appId={appId}
        userPoolId={userPoolId}
        onGuardLogin={onGuardLogin}
      />
    )
  })

  const socialLoginButtons = socialConnectionObjs.map((item: any) => {
    let iconType = `authing-${item.provider.replace(/:/g, '-')}`
    const options: Record<string, any> = {}
    const authorization_params: Record<string, any> = {}
    if (item.provider === SocialConnectionProvider.BAIDU) {
      authorization_params.display = screenSize
    }
    if (config?.isHost) {
      // 如果 isHost 是 true，则从 url 获取 finish_login_url 作为 social.authorize 方法的 targetUrl 参数
      options.targetUrl = querystring.parse(window.location.search)?.[
        'finish_login_url'
      ]
    }
    // 根据 UA 判断是否在微信网页浏览器、钉钉浏览器等内部，使用 form_post 参数作为 social.authorize 方法的 relayMethod 参数，其他情况用 web_message
    options.relayMethod =
      isWechatBrowser() || isLarkBrowser()
        ? RelayMethodEnum.FORM_POST
        : RelayMethodEnum.WEB_MESSAGE

    const onLogin = () => {
      authClient.social.authorize(item.identifier, {
        onSuccess(user) {
          // TODO
          // onSuccess(user)
          onGuardLogin(200, user)
        },
        onError(code, msg, data) {
          try {
            const parsedMsg = JSON.parse(msg)
            const { message: authingMessage, data: authingData } = parsedMsg
            onGuardLogin(code, authingData, authingMessage)
          } catch (e) {
            // do nothing...
            onGuardLogin(code, data, msg)
          }
          // message.error(msg)
        },
        authorization_params,
        ...options,
      })
    }

    const shape = config.socialConnectionsBtnShape

    if (shape === 'button') {
      return (
        <Button
          key={item.id}
          block
          size="large"
          className="g2-guard-third-login-btn"
          icon={
            <IconFont
              type={`${iconType}-fill`}
              style={{ fontSize: 20, marginRight: 8 }}
            />
          }
          onClick={onLogin}
          style={{
            marginBottom: 8,
          }}
        >
          {item.displayName ??
            (i18n.language === 'zh-CN' ? item.name : item.name_en) ??
            item.provider}
        </Button>
      )
    } else if (shape === 'icon') {
      return isPhoneMedia ? (
        <div className="g2-social-login-item" onClick={onLogin}>
          <IconFont type={`${iconType}-fill`} />
        </div>
      ) : (
        <Tooltip
          key={item.id}
          title={item.tooltip?.[i18n.language as Lang] || item.name}
          trigger={['hover', 'click', 'contextMenu']}
        >
          <div className="g2-social-login-item" onClick={onLogin}>
            <IconFont type={`${iconType}-fill`} />
          </div>
        </Tooltip>
      )
    } else {
      return noLoginMethods ? (
        <Button
          key={item.id}
          block
          size="large"
          className="g2-guard-third-login-btn"
          icon={
            <IconFont
              type={`${iconType}-fill`}
              style={{ fontSize: 20, marginRight: 8 }}
            />
          }
          onClick={onLogin}
        >
          {item.displayName ??
            (i18n.language === 'zh-CN' ? item.name : item.name_en) ??
            item.provider}
        </Button>
      ) : isPhoneMedia ? (
        <div className="g2-social-login-item" onClick={onLogin} key={item.id}>
          <IconFont type={`${iconType}-fill`} />
        </div>
      ) : (
        <Tooltip
          overlayStyle={{ fontFamily: 'sans-serif' }}
          key={item.id}
          title={
            item.displayName ||
            item.tooltip?.[i18n.language as Lang] ||
            item.name
          }
          trigger={['hover', 'click', 'contextMenu']}
        >
          <div className="g2-social-login-item" onClick={onLogin}>
            <IconFont type={`${iconType}-fill`} />
          </div>
        </Tooltip>
      )
    }
  })
  const idp = enterpriseConnectionObjs.length ? (
    <>
      {!noLoginMethods && (
        <div className="g2-social-login-title">
          {i18n.t('login.otherLoginWay')}
        </div>
      )}
      <div className="g2-social-login-list">{idpButtons}</div>
    </>
  ) : null
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const socialLogin =
    socialLoginButtons.length > 0 && noLoginMethods ? (
      <Space
        size={noLoginMethods ? 0 : 12}
        className="g2-guard-full-width-space no-login-methods"
        direction="vertical"
      >
        {socialLoginButtons}
      </Space>
    ) : (
      socialLoginButtons.length > 0 && (
        <>
          <div className="g2-social-login-title">
            {t('login.thridAccLogin')}
          </div>
          <div className="g2-social-login-list">{socialLoginButtons}</div>
        </>
      )
    )

  return (
    <>
      {!noLoginMethods && (
        <div
          style={{
            flex: 1,
            minHeight: 32,
          }}
        />
      )}
      <Space
        size={noLoginMethods ? 0 : 12}
        direction="vertical"
        className="g2-guard-full-width-space"
      >
        {!publicConfig?.ssoPageComponentDisplay.idpBtns || idp}
        {!publicConfig?.ssoPageComponentDisplay.socialLoginBtns || socialLogin}
      </Space>
    </>
  )
}
