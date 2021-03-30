import qs from 'qs'
import shortid from 'shortid'
import React, { FC, useEffect } from 'react'
import { Button, Avatar, Space, Tooltip, message } from 'antd'

import { isWechatBrowser, popupCenter } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import {
  APP_MFA_CODE,
  OTP_MFA_CODE,
} from '../../../../components/AuthingGuard/constants'
import {
  Protocol,
  SocialAndIdpLoginProps,
} from '../../../../components/AuthingGuard/types'
import {
  OIDCConnectionConfig,
  ICasConnectionConfig,
  ISamlConnectionConfig,
  IAzureAdConnectionConfig,
  IOAuthConnectionConfig,
} from '../../../../components/AuthingGuard/api'
import { requestClient } from '../../api/http'

import './style.less'
import { IconFont } from '../../IconFont'
import { useScreenSize } from '../../hooks/useScreenSize'
import { SocialConnectionProvider } from 'authing-js-sdk'
import { useTranslation } from 'react-i18next'

export const SocialAndIdpLogin: FC<SocialAndIdpLoginProps> = ({
  onFail = () => {},
  onSuccess = () => {},
}) => {
  const {
    state: { config, userPoolId, appId, authClient },
  } = useGuardContext()
  const { t } = useTranslation()

  const noForm = !config.loginMethods?.length

  const [screenSize] = useScreenSize()

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
          onFail(parsedMsg)
          return
        }
      } catch (e) {
        // do nothing...
      }

      if (code !== undefined) {
        if (code === 200) {
          localStorage.setItem('_authing_token', data?.token)
          onSuccess(data)
        } else {
          message.error(errMsg)
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [onFail, onSuccess])

  const idpButtons = config.enterpriseConnectionObjs.map((i) => {
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
          className="authing-guard-third-login-btn"
          block
          size="large"
          icon={<Avatar size={20} src={i.logo} style={{ marginRight: 8 }} />}
          onClick={async () => {
            await requestClient.post(
              '/api/v2/connections/oidc/start-interaction',
              {
                state,
                protocol: i.protocol,
                userPoolId,
                appId,
                referer: window.location.href,
                connection: { providerIentifier: i.identifier },
              }
            )
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
          className="authing-guard-third-login-btn"
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
          className="authing-guard-third-login-btn"
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
          className="authing-guard-third-login-btn"
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
          className="authing-guard-third-login-btn"
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

  const socialLoginButtons = config.socialConnectionObjs
    .filter((item) =>
      isWechatBrowser()
        ? item.provider === SocialConnectionProvider.WECHATMP
        : item.provider !== SocialConnectionProvider.WECHATMP
    )
    .map((item) => {
      const iconType = `authing-${item.provider.replace(/:/g, '-')}`

      const onLogin = () => {
        authClient.social.authorize(item.provider, {
          onSuccess(user) {
            onSuccess(user)
          },
          onError(code, msg) {
            try {
              const parsedMsg = JSON.parse(msg)
              const { code: authingCode } = parsedMsg
              if ([OTP_MFA_CODE, APP_MFA_CODE].includes(authingCode)) {
                onFail(parsedMsg)
                return
              }
            } catch (e) {
              // do nothing...
            }

            message.error(msg)
          },
          authorization_params: {
            display: screenSize,
          },
        })
      }

      return noForm ? (
        <Button
          key={item.provider}
          block
          size="large"
          className="authing-guard-third-login-btn"
          icon={
            <IconFont
              type={iconType}
              style={{ fontSize: 20, marginRight: 8 }}
            />
          }
          onClick={onLogin}
        >
          {item.name}
        </Button>
      ) : (
        <Tooltip key={item.provider} title={item.name}>
          <div className="authing-social-login-item" onClick={onLogin}>
            <IconFont type={iconType} />
          </div>
        </Tooltip>
      )
    })

  const idp =
    config.enterpriseConnectionObjs.length > 0 ? (
      <>
        {!noForm && <div className="authing-social-login-title">OR</div>}
        <Space
          size={12}
          className="authing-guard-full-width-space"
          direction="vertical"
        >
          {idpButtons}
        </Space>
      </>
    ) : null

  const socialLogin =
    socialLoginButtons.length > 0 && noForm ? (
      <Space
        size={12}
        className="authing-guard-full-width-space"
        direction="vertical"
      >
        {socialLoginButtons}
      </Space>
    ) : (
      socialLoginButtons.length > 0 && (
        <>
          <div className="authing-social-login-title">
            {t('login.thridAccLogin')}
          </div>
          <div className="authing-social-login-list">{socialLoginButtons}</div>
        </>
      )
    )

  return (
    <>
      {!noForm && (
        <div
          style={{
            flex: 1,
            minHeight: 26,
          }}
        ></div>
      )}
      <Space
        size={12}
        direction="vertical"
        className="authing-guard-full-width-space"
      >
        {idp}
        {socialLogin}
      </Space>
    </>
  )
}
