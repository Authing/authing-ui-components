import { Button, Space, Tooltip } from 'antd'
import { SocialConnectionProvider, RelayMethodEnum } from 'authing-js-sdk'
import { Lang } from 'authing-js-sdk/build/main/types'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { i18n } from '../../_utils/locales'
import { isLarkBrowser, isWeChatBrowser } from '../../_utils'
import querystring from 'query-string'
import { ApplicationConfig, SocialConnectionItem } from '../../AuthingGuard/api'
import { useScreenSize } from '../../AuthingGuard/hooks/useScreenSize'
import { useGuardAuthClient } from '../../Guard/authClient'
import { IconFont } from '../../IconFont'
import './style.less'
import { useMediaSize } from '../../_utils/hooks'
import { useGuardPublicConfig } from '../../_utils/context'
import { IdpButton } from './IdpButton'
import { usePostMessage } from './postMessage'
import { CodeAction } from '../../_utils/responseManagement/interface'
import version from '../../version/version'
import { GuardLocalConfig } from '../../Guard'
import { getGuardWindow } from '../../Guard/core/useAppendConfig'

export interface SocialLoginProps {
  appId: string
  config: GuardLocalConfig
  // onLogin: any
  onLoginFailed: any
  onLoginSuccess: any
  enterpriseConnectionObjs: ApplicationConfig['identityProviders']
  socialConnectionObjs: SocialConnectionItem[]
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  appId,
  config,
  onLoginFailed,
  onLoginSuccess,
  enterpriseConnectionObjs,
  socialConnectionObjs,
}) => {
  const noLoginMethods = !config?.loginMethods?.length

  const publicConfig = useGuardPublicConfig()

  const userPoolId = publicConfig?.userPoolId

  const { t } = useTranslation()

  const [screenSize] = useScreenSize()

  const authClient = useGuardAuthClient()

  const { isPhoneMedia } = useMediaSize()

  const onMessage = usePostMessage()

  // const onErrorHandling = useErrorHandling()

  useEffect(() => {
    const onPostMessage = (evt: MessageEvent) => {
      const res = onMessage(evt)

      if (!res) return

      const { code, data, onGuardHandling } = res
      if (code === 200) {
        onLoginSuccess(data)
      } else {
        const handMode = onGuardHandling?.()
        // 向上层抛出错误
        handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)
      }
    }

    const guardWindow = getGuardWindow()

    guardWindow?.addEventListener('message', onPostMessage)
    return () => {
      guardWindow?.removeEventListener('message', onPostMessage)
    }
  }, [onLoginFailed, onLoginSuccess, onMessage])

  const idpButtons = enterpriseConnectionObjs.map((i: any) => {
    return (
      <IdpButton
        key={i.identifier}
        i={i}
        appId={appId}
        userPoolId={userPoolId}
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
      const guardWindow = getGuardWindow()

      if (guardWindow) {
        // 如果 isHost 是 true，则从 url 获取 finish_login_url 作为 social.authorize 方法的 targetUrl 参数
        options.targetUrl = querystring.parse(guardWindow.location.search)?.[
          'finish_login_url'
        ]
      }
    }
    // 根据 UA 判断是否在微信网页浏览器、钉钉浏览器等内部，使用 form_post 参数作为 social.authorize 方法的 relayMethod 参数，其他情况用 web_message
    options.relayMethod =
      isWeChatBrowser() || isLarkBrowser()
        ? RelayMethodEnum.FORM_POST
        : RelayMethodEnum.WEB_MESSAGE

    const onLogin = () => {
      authClient.social.authorize(item.identifier, {
        // onSuccess(user) {
        //   onGuardLogin(200, user)
        // },
        // onError(code, msg, data) {
        //   // try {
        //   //   const parsedMsg = JSON.parse(msg)
        //   //   const { message: authingMessage, data: authingData } = parsedMsg
        //   //   onGuardLogin(code, authingData, authingMessage)
        //   // } catch (e) {
        //   //   // do nothing...
        //   //   onGuardLogin(code, data, msg)
        //   // }
        //   // // message.error(msg)

        //   const { onGuardHandling } = onErrorHandling({
        //     code,
        //     message: msg,
        //     data,
        //   })

        //   onGuardHandling?.()
        // },
        authorization_params,
        // 兼容后端因取不到 guardVersion 而走老版本 guard 逻辑 无法拉起信息补全问题
        guardVersion: `Guard@${version}`,
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
