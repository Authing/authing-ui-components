import { Spin } from 'antd'
import React, { FC, useEffect, useMemo } from 'react'
import { QRCodeUserInfo } from 'authing-js-sdk/build/main/lib/authentication/types'

import { useGuardContext } from '../../../../context/global/context'
import {
  LoginMethods,
  QrLoginFormProps,
} from '../../../../components/AuthingGuard/types'

import './style.less'
import { User } from 'authing-js-sdk'

export const QrCodeLoginForm: FC<QrLoginFormProps> = ({
  onFail,
  onSuccess,
  type,
}) => {
  const {
    state: { authClient, config },
  } = useGuardContext()

  const client = useMemo(() => {
    return {
      [LoginMethods.AppQr]: authClient.qrcode,
      [LoginMethods.WxMinQr]: authClient.wxqrcode,
    }[type]
  }, [type, authClient])

  useEffect(() => {
    const onScanningSuccess = async (
      userInfo: QRCodeUserInfo,
      ticket: string
    ) => {
      config.qrCodeScanOptions?.onSuccess?.(userInfo as QRCodeUserInfo, ticket)

      const { token } = userInfo
      let fullUserInfo: User
      if (!token) {
        // 轮询接口不会返回完整用户信息，需要使用 ticket 换取
        fullUserInfo = (await client.exchangeUserInfo(ticket)) as User
      } else {
        fullUserInfo = userInfo as User
      }
      onSuccess && onSuccess(fullUserInfo)
    }

    client.startScanning('authingGuardQrcode', {
      ...config.qrCodeScanOptions,
      onSuccess: onScanningSuccess,
      onError: (message) => {
        config.qrCodeScanOptions?.onError?.(message)

        onFail && onFail(`${message}`)
      },
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
