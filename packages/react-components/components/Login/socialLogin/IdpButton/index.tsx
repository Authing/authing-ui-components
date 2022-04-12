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
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import shortid from 'shortid'
import { useGuardAuthClient } from '../../../Guard/authClient'
import { IconFont } from '../../../IconFont'
import version from '../../../version/version'
import { popupCenter } from '../../../_utils'
import { getGuardWindow } from '../../../_utils/appendConfig'
import { useGuardHttp } from '../../../_utils/guardHttp'
export const IdpButton = (props: any) => {
  const { i, appId, userPoolId } = props

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const authClient = useGuardAuthClient()

  const renderBtn = useCallback(() => {
    if (i?.provider) {
      // 社交身份源
      const iconType = `authing-${i.provider.replace(/:/g, '-')}`

      const onLogin = async () => {
        await authClient.social.authorize(i.identifier, {
          guardVersion: `Guard@${version}`,

          // onSuccess(user) {
          //   // TODO
          //   // onSuccess(user)
          //   setLoading(false)
          //   onGuardLogin(200, user)
          // },
          // onError(code, msg) {
          //   setLoading(false)
          //   try {
          //     const parsedMsg = JSON.parse(msg)
          //     const { message: authingMessage, data: authingData } = parsedMsg
          //     onGuardLogin(code, authingData, authingMessage)
          //   } catch (e) {
          //     // do nothing...
          //   }
          //   // message.error(msg)
          // },
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
            const guardWindow = getGuardWindow()

            if (!guardWindow) return

            await post('/api/v2/connections/oidc/start-interaction', {
              state,
              protocol: i.protocol,
              userPoolId,
              appId,
              referer: guardWindow?.location.href,
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
  }, [appId, authClient.social, i, post, t, userPoolId])
  return renderBtn()
}
