import { Avatar, Button } from 'antd'
import {
  IAzureAdConnectionConfig,
  ICasConnectionConfig,
  IOAuthConnectionConfig,
  ISamlConnectionConfig,
  OIDCConnectionConfig,
  Protocol,
} from 'authing-js-sdk'
import qs from 'qs'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import shortid from 'shortid'
import { useGuardAuthClient } from '../../../Guard/authClient'
import { IconFont } from '../../../IconFont'
import { isLarkBrowser, isWechatBrowser, popupCenter } from '../../../_utils'
import { useGuardHttp } from '../../../_utils/guradHttp'
export const IdpButton = (props: any) => {
  const { i, appId, userPoolId, onGuardLogin } = props

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const authClient = useGuardAuthClient()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const popStateEvent = () => {
      setLoading(false)
    }
    window.addEventListener('popstate', popStateEvent)
    return () => {
      window.removeEventListener('popstate', popStateEvent)
    }
  }, [])
  const renderBtn = useCallback(() => {
    if (i?.provider) {
      // 社交身份源
      const iconType = `authing-${i.provider.replace(/:/g, '-')}`

      const onLogin = () => {
        setLoading(true)
        authClient.social.authorize(i.identifier, {
          onSuccess(user) {
            // TODO
            // onSuccess(user)
            setLoading(false)
            onGuardLogin(200, user)
          },
          onError(code, msg) {
            setLoading(false)
            try {
              const parsedMsg = JSON.parse(msg)
              const { message: authingMessage, data: authingData } = parsedMsg
              onGuardLogin(code, authingData, authingMessage)
            } catch (e) {
              // do nothing...
            }
            // message.error(msg)
          },
        })
      }
      return (
        <Button
          key={i.identifier}
          className="g2-guard-third-login-btn"
          block
          size="large"
          icon={
            <IconFont
              type={`${iconType}-fill`}
              style={{ fontSize: 20, marginRight: 8 }}
            />
          }
          onClick={onLogin}
          loading={isWechatBrowser() || isLarkBrowser() ? loading : false}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    }
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
            setLoading(true)
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
          loading={isWechatBrowser() || isLarkBrowser() ? loading : false}
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
            setLoading(true)
            popupCenter(config.samlRequest!)
          }}
          loading={isWechatBrowser() || isLarkBrowser() ? loading : false}
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
            setLoading(true)
            popupCenter(config.casConnectionLoginUrl!)
          }}
          loading={isWechatBrowser() || isLarkBrowser() ? loading : false}
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
            setLoading(true)
            popupCenter(config.authUrl!)
          }}
          loading={isWechatBrowser() || isLarkBrowser() ? loading : false}
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
            setLoading(true)
            popupCenter(configItem.authorizationUrl)
          }}
          loading={isWechatBrowser() || isLarkBrowser() ? loading : false}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    } else {
      return null
    }
  }, [appId, authClient.social, i, loading, onGuardLogin, post, t, userPoolId])
  return renderBtn()
}
