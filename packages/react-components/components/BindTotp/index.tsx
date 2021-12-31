import { message } from 'antd'
import { User } from 'authing-js-sdk'
import React, { useEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { ErrorCode } from '../_utils/GuardErrorCode'
import { useGuardHttp } from '../_utils/guradHttp'
import { useGuardAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { ShieldSpin, Spin } from '../ShieldSpin'
import { BindSuccess } from './core/bindSuccess'
import { SecurityCode } from './core/securityCode'
import { GuardBindTotpViewProps } from './interface'
import { useTranslation } from 'react-i18next'
import './styles.less'
import { shoudGoToComplete } from '../_utils'
import { usePublicConfig } from '../_utils/context'

enum BindTotpType {
  SECURITY_CODE = 'securityCode',
  BIND_SUCCESS = 'bindSuccess',
}

export const GuardBindTotpView: React.FC<GuardBindTotpViewProps> = ({
  config,
  initData,
  onLogin,
  __changeModule,
}) => {
  const { get, post } = useGuardHttp()
  const { t } = useTranslation()
  const [secret, setSecret] = useState('')
  const [qrcode, setQrcode] = useState('')
  const [user, setUser] = useState<User>()
  const publicConfig = usePublicConfig()
  const [bindTotpType, setBindTotpType] = useState<BindTotpType>(
    BindTotpType.SECURITY_CODE
  )

  const authClient = useGuardAuthClient()

  const [bindInfo, fetchBindInfo] = useAsyncFn(async () => {
    const query = {
      type: 'totp',
      source: 'APPLICATION',
    }
    const config = {
      headers: {
        authorization: initData.mfaToken,
      },
    }

    try {
      const { data } = await get<any>(
        `/api/v2/mfa/authenticator`,
        query,
        config
      )

      if (data.code === ErrorCode.LOGIN_INVALID) {
        message.error(data.message)
        __changeModule?.(GuardModuleType.LOGIN, {})
        return
      }
    } catch (error: any) {
      message.error(error?.message)
    }

    const { data } = await post<any>(
      '/api/v2/mfa/totp/associate',
      query,
      config
    )

    setSecret(data.recovery_code)
    setQrcode(data.qrcode_data_url)
  }, [initData.mfaToken])

  const onBind = () => {
    if (user) {
      if (shoudGoToComplete(user, 'login', publicConfig, config.autoRegister)) {
        console.log('登陆成功，用户为', user)
        __changeModule?.(GuardModuleType.COMPLETE_INFO, {
          context: 'login',
          user: user,
        })
      } else {
        onLogin?.(user, authClient) // 登录成功
      }
    }
  }

  const onNext = (user: User) => {
    setUser(user)
    setBindTotpType(BindTotpType.BIND_SUCCESS)
  }

  useEffect(() => {
    fetchBindInfo()
  }, [fetchBindInfo])

  const renderContent = useMemo<
    Record<BindTotpType, (props: any) => React.ReactNode>
  >(
    () => ({
      [BindTotpType.SECURITY_CODE]: (props) => <SecurityCode {...props} />,
      [BindTotpType.BIND_SUCCESS]: (props) => <BindSuccess {...props} />,
    }),
    []
  )

  const onBack = () => {
    window.history.back()
  }

  return (
    <>
      {bindInfo.loading ? (
        <Spin />
      ) : (
        <div className="g2-view-container">
          <div className="g2-view-back" style={{ display: 'inherit' }}>
            <span onClick={onBack} className="g2-view-mfa-back-hover">
              <IconFont
                type="authing-arrow-left-s-line"
                style={{ fontSize: 24 }}
              />
              <span>{t('common.backToVerify')}</span>
            </span>
          </div>
          <div className="g2-mfa-content g2-mfa-bindTotp">
            {bindInfo.loading ? (
              <ShieldSpin />
            ) : (
              renderContent[bindTotpType]({
                mfaToken: initData.mfaToken,
                qrcode,
                secret,
                onBind,
                onNext,
                changeModule: __changeModule,
              })
            )}
          </div>
        </div>
      )}
    </>
  )
}
