import { Avatar } from 'antd'
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
import { getGuardWindow } from '../../../Guard/core/useAppendConfig'
import { GuardButton } from '../../../GuardButton'
import { IconFont } from '../../../IconFont'
import version from '../../../version/version'
import { isSpecialBrowser, popupCenter } from '../../../_utils'
import { useGuardHttp } from '../../../_utils/guardHttp'

export const IdpButton = (props: any) => {
  // TODO: 能不能加个类型
  const { i, appId, userPoolId, appHost, isHost } = props

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const renderBtn = useCallback(() => {
    if (i?.provider) {
      // 社交身份源
      const iconType = `authing-${i.provider.replace(/:/g, '-')}`

      const query: Record<string, any> = {
        from_guard: '1',
        app_id: appId,
        guard_version: `Guard@${version}`,
      }

      if (isHost) {
        query.from_hosted_guard = '1'

        if (isSpecialBrowser()) {
          query.redirected = '1'

          const guardWindow = getGuardWindow()
          if (guardWindow) {
            // 如果 isHost 是 true，则从 url 获取 finish_login_url 作为 social.authorize 方法的 targetUrl 参数
            query.redirect_url = qs.parse(guardWindow.location.search)?.[
              'finish_login_url'
            ]
          }
        }
      }

      const onLogin = () => {
        const initUrl = `${appHost}/connections/social/${
          i.identifier
        }?${qs.stringify(query)}`

        if (query.redirected) {
          window.location.replace(initUrl)
        } else {
          popupCenter(initUrl)
        }
      }

      return (
        <GuardButton
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
        </GuardButton>
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
        <GuardButton
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
        </GuardButton>
      )
    } else if (i.protocol === Protocol.SAML) {
      const config = i.config as ISamlConnectionConfig
      return (
        <GuardButton
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
        </GuardButton>
      )
    } else if (i.protocol === Protocol.CAS) {
      const config = i.config as ICasConnectionConfig

      return (
        <GuardButton
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
        </GuardButton>
      )
    } else if (i.protocol === Protocol.OAUTH) {
      const config = i.config as IOAuthConnectionConfig

      return (
        <GuardButton
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
        </GuardButton>
      )
    } else if (i.protocol === Protocol.AZURE_AD) {
      const configItem = i.config as IAzureAdConnectionConfig
      return (
        <GuardButton
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
        </GuardButton>
      )
    } else {
      return null
    }
  }, [appId, i, post, t, userPoolId, isHost, appHost])
  return renderBtn()
}
