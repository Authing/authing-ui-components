import { Button, Space, Tooltip } from 'antd'
import { SocialConnectionProvider, RelayMethodEnum } from 'authing-js-sdk'
import { Lang } from 'authing-js-sdk/build/main/types'
import React, { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { i18n } from '../../_utils/locales'
import { isLarkBrowser, isWeChatBrowser } from '../../_utils'
import querystring from 'query-string'
import { ApplicationConfig, SocialConnectionItem } from '../../AuthingGuard/api'
import {
  HIDE_SOCIALS,
  HIDE_SOCIALS_SHOWIN_ENTERPRISE,
} from '../../AuthingGuard/constants'
import { useScreenSize } from '../../AuthingGuard/hooks/useScreenSize'
import { useGuardAuthClient } from '../../Guard/authClient'
import { IconFont } from '../../IconFont'
import { LoginConfig } from '../interface'
import './style.less'
import { useMediaSize } from '../../_utils/hooks'
import { useGuardPublicConfig } from '../../_utils/context'
import { IdpButton } from './IdpButton'
import { usePostMessage } from './postMessage'

export interface SocialLoginProps {
  appId: string
  config: LoginConfig
  onLogin: any
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  appId,
  config,
  onLogin: onGuardLogin,
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
        onGuardLogin(200, data)
      } else {
        onGuardHandling?.()
      }
    }
    window.addEventListener('message', onPostMessage)
    return () => {
      window.removeEventListener('message', onPostMessage)
    }
  }, [onGuardLogin, onMessage])

  useEffect(() => {
    const containerDOM = document.getElementsByClassName('g2-view-header')?.[0]
    const innerContainer = document.querySelector(
      '.g2-view-login>.g2-view-container-inner'
    )
    if (isPhoneMedia && noLoginMethods) {
      if (containerDOM) {
        containerDOM.classList.add('g2-view-header-mobile')
      }
      if (innerContainer) {
        innerContainer.classList.add('g2-view-login-mobile-inner')
      }
    } else {
      containerDOM.classList.remove('g2-view-header-mobile')
      innerContainer?.classList.remove('g2-view-login-mobile-inner')
    }
    return () => {
      containerDOM.classList.remove('g2-view-header-mobile')
      innerContainer?.classList.remove('g2-view-login-mobile-inner')
    }
  })

  useLayoutEffect(() => {
    if (noLoginMethods && !isPhoneMedia) {
      // pc 下
      const containerDOM = document.getElementsByClassName(
        'g2-view-container'
      )?.[0]

      if (containerDOM) {
        // @ts-ignore
        containerDOM.style['min-height'] = '410px'
        containerDOM.classList.add('no-login-methods-view')
        return () => {
          // @ts-ignore
          containerDOM.style['min-height'] = '610px'
          containerDOM.classList.remove('no-login-methods-view')
        }
      }
    }
  }, [isPhoneMedia, noLoginMethods])

  let enterpriseConnectionObjs: ApplicationConfig['identityProviders']

  if (config.enterpriseConnections) {
    enterpriseConnectionObjs =
      publicConfig?.identityProviders?.filter?.((item) =>
        config.enterpriseConnections!.includes(item.identifier)
      ) || []
  } else {
    enterpriseConnectionObjs = publicConfig?.identityProviders || []
  }

  let socialConnectionObjs: SocialConnectionItem[]

  if (!config.socialConnections) {
    socialConnectionObjs = [...(publicConfig?.socialConnections || [])]
  } else {
    const socials = config.socialConnections
    socialConnectionObjs =
      publicConfig?.socialConnections?.filter?.((item) =>
        socials.includes(item.provider)
      ) ?? []
  }

  // 某些社会化登录会在 tabs 中显示，或者无法在 Guard 中使用，所以底部不显示了
  socialConnectionObjs = socialConnectionObjs?.filter(
    (item) => !HIDE_SOCIALS.includes(item.provider)
  )
  // 某些在企业身份源创建的社交身份源归为企业身份源方式显示
  socialConnectionObjs = socialConnectionObjs?.filter((item: any) => {
    if (HIDE_SOCIALS_SHOWIN_ENTERPRISE.includes(item.provider)) {
      if (
        !enterpriseConnectionObjs.find(
          (connection: any) => connection.identifier === item.identifier
        )
      ) {
        enterpriseConnectionObjs.push(item)
      }
      return false
    }
    return true
  })
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
  const socialLoginButtons = socialConnectionObjs
    .filter((item) =>
      isWeChatBrowser()
        ? item.provider === SocialConnectionProvider.WECHATMP
        : item.provider !== SocialConnectionProvider.WECHATMP
    )
    .filter((item) => {
      if (isLarkBrowser()) {
        return (
          item.provider === SocialConnectionProvider.LARK_INTERNAL ||
          item.provider === SocialConnectionProvider.LARK_PUBLIC
        )
      } else {
        return true
      }
    })
    .map((item: any) => {
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
          <div className="g2-social-login-item" onClick={onLogin}>
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
        {noLoginMethods && !socialLoginButtons.length && !idpButtons.length && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <IconFont
              type="authing-bianzu"
              style={{ width: 178, height: 120 }}
            />
            <span className="no-login-methods-desc">
              {t('login.noLoginMethodsDesc')}
            </span>
          </div>
        )}
      </Space>
    </>
  )
}
