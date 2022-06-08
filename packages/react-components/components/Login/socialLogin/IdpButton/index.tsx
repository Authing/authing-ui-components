import { Avatar, Button } from 'antd'
import { Protocol } from 'authing-js-sdk'
import qs from 'qs'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getGuardWindow } from '../../../Guard/core/useAppendConfig'
import { IconFont } from '../../../IconFont'
import version from '../../../version/version'
import { isSpecialBrowser, popupCenter } from '../../../_utils'
import { useGuardTenantId } from '../../../_utils/context'

const baseLoginPathMapping: Record<Protocol, string | null> = {
  [Protocol.OIDC]: '/connections/oidc/init',
  [Protocol.SAML]: '/connections/saml/init',
  [Protocol.CAS]: '/connections/cas/init',
  [Protocol.OAUTH]: '/connections/oauth2/init',
  [Protocol.AZURE_AD]: '/connections/azure-ad/init',
}

export const IdpButton = (props: any) => {
  // TODO: 能不能加个类型
  const { i, appId, appHost, isHost } = props

  const { t } = useTranslation()
  const tenantId = useGuardTenantId()

  const renderBtn = useCallback(() => {
    const query: Record<string, any> = {
      from_guard: '1',
      app_id: appId,
      guard_version: `Guard@${version}`,
      ...(tenantId && { tenant_id: tenantId }),
    }

    if (isHost) {
      delete query.from_guard
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

    if (i?.provider) {
      // 社交身份源
      const iconType = `authing-${i.provider.replace(/:/g, '-')}`

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
    } else {
      query.identifier = i.identifier

      const basePath = baseLoginPathMapping[i.protocol as Protocol]
      if (!basePath) {
        return null
      }

      return (
        <Button
          key={i.identifier}
          className="g2-guard-third-login-btn"
          block
          size="large"
          icon={<Avatar size={20} src={i.logo} style={{ marginRight: 8 }} />}
          onClick={() => {
            const initUrl = `${appHost}${basePath}?${qs.stringify(query)}`

            if (query.redirected) {
              window.location.replace(initUrl)
            } else {
              popupCenter(initUrl)
            }
          }}
        >
          {t('login.loginBy', {
            name: i.displayName,
          })}
        </Button>
      )
    }
  }, [appId, i, t, isHost, appHost, tenantId])
  return renderBtn()
}
