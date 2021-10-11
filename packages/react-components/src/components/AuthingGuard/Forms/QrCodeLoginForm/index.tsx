import { Spin } from 'antd'
import React, { FC, useEffect, useMemo, useRef } from 'react'

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

  const timerRef = useRef<any>()

  const client = useMemo(() => {
    return {
      [LoginMethods.AppQr]: authClient.qrcode,
      [LoginMethods.WxMinQr]: authClient.wxqrcode,
      [LoginMethods.WechatMpQrcode]: authClient.wechatmpqrcode,
    }[type]
  }, [type, authClient])

  useEffect(() => {
    client.startScanning('authingGuardQrcode', {
      autoExchangeUserInfo: true,
      ...config.qrCodeScanOptions,
      onStart(timer) {
        timerRef.current = timer
      },
      onSuccess(user) {
        onSuccess && onSuccess(user as User)
      },
      onError: (message) => {
        config.qrCodeScanOptions?.onError?.(message)

        onFail && onFail(`${message}`)
      },
    })
    return () => clearInterval(timerRef.current)
  }, [client, config.qrCodeScanOptions, onFail, onSuccess])

  return (
    <div className="authing-guard-qr-form">
      <div className="authing-guard-qr-loading">
        <Spin size="large" />
      </div>
      <div id="authingGuardQrcode"></div>
    </div>
  )
}
