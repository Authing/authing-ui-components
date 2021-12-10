import { Button, message, Space, Tooltip } from 'antd'
import Avatar from 'antd/lib/avatar/avatar'
import { Protocol, SocialConnectionProvider } from 'authing-js-sdk'
import { Lang } from 'authing-js-sdk/build/main/types'
import qs from 'qs'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import shortid from 'shortid'
import { i18n } from '../../_utils/locales'
import { isWechatBrowser, popupCenter } from '../../_utils'
import { useGuardHttp } from '../../_utils/guradHttp'
import {
  ApplicationConfig,
  IAzureAdConnectionConfig,
  ICasConnectionConfig,
  IOAuthConnectionConfig,
  ISamlConnectionConfig,
  OIDCConnectionConfig,
  SocialConnectionItem,
} from '../../AuthingGuard/api'
import {
  APP_MFA_CODE,
  HIDE_SOCIALS,
  OTP_MFA_CODE,
} from '../../AuthingGuard/constants'
import { useScreenSize } from '../../AuthingGuard/hooks/useScreenSize'
import { useAuthClient } from '../../Guard/authClient'
import { IconFont } from '../../IconFont'
import { LoginConfig } from '../interface'
import './style.less'

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
  const noLoginMethods = !config.loginMethods.length

  const userPoolId = config.__publicConfig__?.userPoolId

  const publicConfig = config.__publicConfig__

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const [screenSize] = useScreenSize()

  const authClient = useAuthClient()

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
        const { code: authingCode } = parsedMsg
        if ([OTP_MFA_CODE, APP_MFA_CODE].includes(authingCode)) {
          //   onFail(parsedMsg)
          // TODO
          return
        }
      } catch (e) {
        // do nothing...
      }

      if (code !== undefined) {
        if (code === 200) {
          localStorage.setItem('_authing_token', data?.token)
          //   onSuccess(data)
          // TODO
        } else {
          message.error(errMsg)
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  let enterpriseConnectionObjs: ApplicationConfig['identityProviders']

  if (config.enterpriseConnections) {
    enterpriseConnectionObjs =
      config.__publicConfig__?.identityProviders?.filter?.((item) =>
        config.enterpriseConnections!.includes(item.identifier)
      ) || []
  } else {
    enterpriseConnectionObjs = config.__publicConfig__?.identityProviders || []
  }

  const idpButtons = enterpriseConnectionObjs.map((i) => {
    if (i.protocol === Protocol.OIDC) {
      const configItem = i.config as OIDCConnectionConfig
      const state = shortid.generate()

      const query = qs.stringify({
        client_id: configItem.clientId,
        redirect_uri: configItem.redirectUri,
        scope: configItem.scopes,
        response_type: configItem.responseType,
        state,
        nonce: shortid.generate(),
      })
      const url = `${configItem.authorizationEdpoint}?${query}`

      return (
        <Button
          key={i.identifier}
          className="g2-guard-third-login-btn"
          block
          size="large"
          icon={<Avatar size={20} src={i.logo} style={{ marginRight: 8 }} />}
          onClick={async () => {
            await post('/api/v2/connections/oidc/start-interaction', {
              state,
              protocol: i.protocol,
              userPoolId,
              appId,
              referer: window.location.href,
              connection: { providerIentifier: i.identifier },
            })
            popupCenter(url)
          }}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    } else if (i.protocol === Protocol.SAML) {
      const config = i.config as ISamlConnectionConfig
      return (
        <Button
          key={i.identifier}
          className="g2-guard-third-login-btn"
          block
          size="large"
          icon={<Avatar size={20} src={i.logo} style={{ marginRight: 8 }} />}
          onClick={async () => {
            popupCenter(config.samlRequest!)
          }}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    } else if (i.protocol === Protocol.CAS) {
      const config = i.config as ICasConnectionConfig

      return (
        <Button
          key={i.identifier}
          className="g2-guard-third-login-btn"
          block
          size="large"
          icon={<Avatar size={20} src={i.logo} style={{ marginRight: 8 }} />}
          onClick={async () => {
            popupCenter(config.casConnectionLoginUrl!)
          }}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    } else if (i.protocol === Protocol.OAUTH) {
      const config = i.config as IOAuthConnectionConfig

      return (
        <Button
          key={i.identifier}
          className="g2-guard-third-login-btn"
          block
          size="large"
          icon={<Avatar size={20} src={i.logo} style={{ marginRight: 8 }} />}
          onClick={async () => {
            popupCenter(config.authUrl!)
          }}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    } else if (i.protocol === Protocol.AZURE_AD) {
      const configItem = i.config as IAzureAdConnectionConfig
      return (
        <Button
          key={i.identifier}
          className="g2-guard-third-login-btn"
          block
          size="large"
          icon={<Avatar size={20} src={i.logo} style={{ marginRight: 8 }} />}
          onClick={async () => {
            popupCenter(configItem.authorizationUrl)
          }}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    } else {
      return null
    }
  })

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

  const socialLoginButtons = socialConnectionObjs
    .filter((item) =>
      isWechatBrowser()
        ? item.provider === SocialConnectionProvider.WECHATMP
        : item.provider !== SocialConnectionProvider.WECHATMP
    )
    .map((item) => {
      const iconType = `authing-${item.provider.replace(/:/g, '-')}`

      const authorization_params: Record<string, any> = {}
      if (item.provider === SocialConnectionProvider.BAIDU) {
        authorization_params.display = screenSize
      }

      const onLogin = () => {
        authClient.social.authorize(item.provider, {
          onSuccess(user) {
            // TODO
            // onSuccess(user)
            onGuardLogin(200, user)
          },
          onError(code, msg) {
            try {
              const parsedMsg = JSON.parse(msg)
              const {
                code: authingCode,
                message: authingMessage,
                data: authingData,
              } = parsedMsg
              // if ([OTP_MFA_CODE, APP_MFA_CODE].includes(authingCode)) {
              //   // TODO
              //   onGuardLogin(authingCode, authingData, authingMessage)
              //   return
              // }
              onGuardLogin(authingCode, authingData, authingMessage)
            } catch (e) {
              // do nothing...
            }

            message.error(msg)
          },
          authorization_params,
        })
      }

      const shape = config.socialConnectionsBtnShape

      if (shape === 'button') {
        return (
          <Button
            key={item.provider}
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
            {i18n.language === 'zh-CN'
              ? item.name
              : item.name_en ?? item.provider}
          </Button>
        )
      } else if (shape === 'icon') {
        return (
          <Tooltip
            key={item.provider}
            title={item.tooltip?.[i18n.language as Lang] || item.name}
          >
            <div className="g2-social-login-item" onClick={onLogin}>
              <IconFont type={`${iconType}-fill`} />
            </div>
          </Tooltip>
        )
      } else {
        return noLoginMethods ? (
          <Button
            key={item.provider}
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
            {i18n.language === 'zh-CN'
              ? item.name
              : item.name_en ?? item.provider}
          </Button>
        ) : (
          <Tooltip
            overlayStyle={{ fontFamily: 'sans-serif' }}
            key={item.provider}
            title={item.tooltip?.[i18n.language as Lang] || item.name}
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

  // let socialLogin
  // const shape = config.socialConnectionsBtnShape

  const socialLogin =
    socialLoginButtons.length > 0 && noLoginMethods ? (
      <Space
        size={12}
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
        size={12}
        direction="vertical"
        className="g2-guard-full-width-space"
      >
        {!publicConfig?.ssoPageComponentDisplay.idpBtns || idp}
        {!publicConfig?.ssoPageComponentDisplay.socialLoginBtns || socialLogin}
      </Space>
    </>
  )
}
