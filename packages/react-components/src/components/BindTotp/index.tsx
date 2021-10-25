import { User } from 'authing-js-sdk'
import React, { useEffect, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useGuardHttp } from 'src/utils/guradHttp'
import { useAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { MFAType } from '../MFA/props'
import { ShieldSpin } from '../ShieldSpin'
import { BindSuccess } from './core/bindSuccess'
import { SecurityCode } from './core/securityCode'
import { GuardBindTotpViewProps } from './props'
import './styles.less'

enum BindTotpType {
  SECURITY_CODE = 'securityCode',
  BIND_SUCCESS = 'bindSuccess',
}

export const GuardBindTotpView: React.FC<GuardBindTotpViewProps> = ({
  config: GuardConfig,
  initData,
  onLogin,
  __changeModule,
  __back,
}) => {
  const { get, post } = useGuardHttp()

  const [secret, setSecret] = useState('')
  const [qrcode, setQrcode] = useState('')
  const [user, setUser] = useState<User>()
  const [bindTotpType, setBindTotpType] = useState<BindTotpType>(
    BindTotpType.SECURITY_CODE
  )

  const authClient = useAuthClient()

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

    await get(`/api/v2/mfa/authenticator`, query, config)

    const { data } = await post<any>(
      '/api/v2/mfa/totp/associate',
      query,
      config
    )

    setSecret(data.recovery_code)
    setQrcode(data.qrcode_data_url)
  }, [initData.mfaToken])

  const onBind = () => {
    console.log('绑定完成', user)
    if (user) onLogin?.(user, authClient)
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
    __back?.({
      current: MFAType.TOTP,
    })
  }

  return (
    <div className="g2-view-container">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>返回验证页</span>
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
          })
        )}
      </div>
    </div>
  )
}
