import { message } from 'antd'
import { User } from 'authing-js-sdk'
import React, { useEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { ErrorCode } from '../_utils/GuardErrorCode'
import { useGuardHttp } from '../_utils/guardHttp'
import { useGuardAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { ShieldSpin, Spin } from '../ShieldSpin'
import { BindSuccess } from './core/bindSuccess'
import { SecurityCode } from './core/securityCode'
import { GuardBindTotpInitData } from './interface'
import { useTranslation } from 'react-i18next'
import './styles.less'
import {
  useGuardEvents,
  useGuardInitData,
  useGuardIsAuthFlow,
  useGuardModule,
} from '../_utils/context'
import { MFAType } from '../MFA/interface'

enum BindTotpType {
  SECURITY_CODE = 'securityCode',
  BIND_SUCCESS = 'bindSuccess',
}

export const GuardBindTotpView: React.FC = () => {
  const initData = useGuardInitData<GuardBindTotpInitData>()

  const events = useGuardEvents()

  const { changeModule } = useGuardModule()

  const { get, post } = useGuardHttp()

  const isAuthFlow = useGuardIsAuthFlow()

  const { t } = useTranslation()

  const [secret, setSecret] = useState('')

  const [qrcode, setQrcode] = useState('')

  const [user, setUser] = useState<User>()

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
        // TODO 可以用拦截后暴露的 onGuardHandling 处理
        message.error(data.message)
        changeModule?.(GuardModuleType.LOGIN, {})
        return
      }
    } catch (error: any) {
      message.error(error?.message)
    }

    try {
      const { data, code, onGuardHandling } = await post<any>(
        '/api/v2/mfa/totp/associate',
        query,
        config
      )
      if (code === 200) {
        setSecret(data.recovery_code)
        setQrcode(data.qrcode_data_url)
      } else {
        onGuardHandling?.()
      }
    } catch (error: any) {
      message.error(error?.message)
    }
  }, [])

  const onBind = (resUser?: User) => {
    if (isAuthFlow && resUser) {
      events?.onLogin?.(resUser, authClient)
    } else {
      if (user) {
        events?.onLogin?.(user, authClient)
      }
    }
  }

  const onNext = (user?: User) => {
    if (isAuthFlow) {
      setBindTotpType(BindTotpType.BIND_SUCCESS)
    } else {
      setUser(user)
      setBindTotpType(BindTotpType.BIND_SUCCESS)
    }
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
    changeModule?.(GuardModuleType.MFA, { ...initData, current: MFAType.TOTP })
  }

  return (
    <>
      {bindInfo.loading ? (
        <Spin />
      ) : (
        <div className="g2-view-container g2-bind-totp">
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
                changeModule: changeModule,
              })
            )}
          </div>
        </div>
      )}
    </>
  )
}
