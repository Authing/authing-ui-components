import React, { useEffect, useRef } from 'react'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithAppQrcodeProps {
  onLogin: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithAppQrcode = (props: LoginWithAppQrcodeProps) => {
  const timerRef = useRef<any>()
  const client = useAuthClient()
  const appQrcodeClient = client.qrcode
  // const config = props.config

  useEffect(() => {
    if (!props.canLoop) {
      return
    }

    appQrcodeClient.startScanning('authingGuardAppQrcode', {
      autoExchangeUserInfo: true,
      ...props.qrCodeScanOptions,
      onStart(timer) {
        console.log('开始扫码')
        timerRef.current = timer
      },
      onSuccess(user) {
        console.log('扫码完成', user)
        props.onLogin(200, user)
      },
      onError: (message) => {
        // config.qrCodeScanOptions?.onError?.(message)
        // onFail && onFail(`${message}`)
        console.log('扫码错误', message)
      },
    })
    return () => clearInterval(timerRef.current)
  }, [appQrcodeClient, props.canLoop])

  return (
    <div className="authing-g2-login-app-qrcode">
      <div id="authingGuardAppQrcode"></div>
    </div>
  )
}
