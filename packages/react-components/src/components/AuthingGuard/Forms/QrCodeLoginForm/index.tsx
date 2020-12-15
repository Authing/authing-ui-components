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
  }, [client, config.qrCodeScanOptions, onFail, onSuccess])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
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
