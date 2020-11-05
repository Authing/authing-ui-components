import { Spin } from 'antd'
import React, { FC, useEffect, useMemo } from 'react'

import { useGuardContext } from '@/context/global/context'
import { LoginMethods, QrLoginFormProps } from '@/components/AuthingGuard/types'

import './style.less'
import { User } from 'authing-js-sdk'

export const QrCodeLoginForm: FC<QrLoginFormProps> = ({
  onFail,
  onSuccess,
  type,
}) => {
  const {
    state: { authClient },
  } = useGuardContext()

  const client = useMemo(() => {
    return {
      [LoginMethods.AppQr]: authClient.qrcode,
      [LoginMethods.WxMinQr]: authClient.wxqrcode,
    }[type]
  }, [type, authClient])

  useEffect(() => {
    const onScanningSuccess = async (
      userInfo: Partial<User>,
      ticket: string
    ) => {
      const { token } = userInfo
      if (!token) {
        // 轮询接口不会返回完整用户信息，需要使用 ticket 换取
        userInfo = await client.exchangeUserInfo(ticket)
      }
      onSuccess && onSuccess(userInfo as User)
    }

    client.startScanning('authingGuardQrcode', {
      // onCodeShow:
      onSuccess: onScanningSuccess,
      onError: (message) => onFail && onFail(`${message}`),
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="authing-guard-qr-form">
      <div className="authing-guard-qr-loading">
        <Spin size="large" />
      </div>
      <div id="authingGuardQrcode"></div>
    </div>
  )
}
