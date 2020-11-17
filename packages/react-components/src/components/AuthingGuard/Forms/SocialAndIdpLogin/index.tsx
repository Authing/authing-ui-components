import qs from 'qs'
import shortid from 'shortid'
import React, { FC, useEffect } from 'react'
import { Button, Avatar, Space, Tooltip, message } from 'antd'

import { popupCenter } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { NEED_MFA_CODE } from '../../../../components/AuthingGuard/constants'
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

export const SocialAndIdpLogin: FC<SocialAndIdpLoginProps> = ({
  onFail = () => {},
  onSuccess = () => {},
}) => {
  const {
    state: { config, userPoolId },
  } = useGuardContext()

  const noForm = !config.loginMethods?.length

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // TODO: event.origin是指发送的消息源，一定要进行验证！！！

      const { code, message: errMsg, data } = event.data
      // TODO: 和前端约定

      try {
        const parsedMsg = JSON.parse(errMsg)
        const { code: authingCode } = parsedMsg
        if (authingCode === NEED_MFA_CODE) {
          onFail(parsedMsg)
          return
        }
      } catch (e) {
        // do nothing...
      }

      if (code !== undefined) {
        if (code === 200) {
          onSuccess(data)
        } else {
          message.error(JSON.stringify(errMsg))
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
                appId: config.appId,
                referer: window.location.href,
                connection: { providerIentifier: i.identifier },
              }
            )
            popupCenter(url)
          }}
        >
          使用 {i.displayName} 登录
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
          使用 {i.displayName} 登录
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
          使用 {i.displayName} 登录
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
          使用 {i.displayName} 登录
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
          使用 {i.displayName} 登录
        </Button>
      )
    } else {
      return null
    }
  })

  const socialLoginButtons = config.socialConnectionObjs.map((item) => {
    const url = item.authorizationUrl + '?from_guard=1'
    const cls = `authing-icon authing-${item.provider.replace(/:/g, '-')}`

    return noForm ? (
      <Button
        key={item.provider}
        block
        size="large"
        className="authing-guard-third-login-btn"
        icon={<i className={cls} style={{ fontSize: 20, marginRight: 8 }} />}
        onClick={async () => {
          popupCenter(url)
        }}
      >
        {item.name}
      </Button>
    ) : (
      <Tooltip key={item.provider} title={item.name}>
        <div
          className="authing-social-login-item"
          onClick={() => popupCenter(url)}
        >
          <i className={cls} />
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
    config.socialConnectionObjs.length > 0 && noForm ? (
      <Space
        size={12}
        className="authing-guard-full-width-space"
        direction="vertical"
      >
        {socialLoginButtons}
      </Space>
    ) : (
      config.socialConnectionObjs.length > 0 && (
        <>
          <div className="authing-social-login-title">第三方账号登录</div>
          <div className="authing-social-login-list">{socialLoginButtons}</div>
        </>
      )
    )

  return (
    <>
      <div
        style={{
          flex: 1,
          minHeight: 26,
        }}
      ></div>
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
