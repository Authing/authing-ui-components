import qs from 'qs'
import React, { useEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useGuardHttp } from 'src/utils/guradHttp'
import { IconFont } from '../IconFont'
import { GuardBindTotpViewProps } from './props'

export const BindTotpView: React.FC<GuardBindTotpViewProps> = ({
  config: GuardConfig,
  initData,
}) => {
  const { get, post } = useGuardHttp()

  const [secret, setSecret] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [qrcode, setQrcode] = useState('')

  const [bindInfo, fetchBindInfo] = useAsyncFn(async () => {
    const query = {
      type: 'totp',
      source: 'SELF',
    }
    const config = {
      headers: {
        mfaToken: initData.mfaToken,
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
    setMfaSecret(data.data.secret)
  }, [initData.mfaToken])

  useEffect(() => {
    fetchBindInfo()
  }, [fetchBindInfo])

  const onBack = () => {}
  return (
    <div className="g2-view-container">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>返回验证页</span>
        </span>
      </div>
      <div className="g2-mfa-content"></div>
    </div>
  )
}
