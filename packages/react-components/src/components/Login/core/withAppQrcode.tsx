import React, { useEffect, useRef } from 'react'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithAppQrcodeProps {
  onLogin: any
}

export const LoginWithAppQrcode = (props: LoginWithAppQrcodeProps) => {
  const timerRef = useRef<any>()
  const client = useAuthClient()
  const appQrcodeClient = client.qrcode
  // const config = props.config

  useEffect(() => {
    appQrcodeClient.startScanning('authingGuardQrcode', {
      autoExchangeUserInfo: true,
      // ...config.qrCodeScanOptions,
      onStart(timer) {
        console.log('开始扫码')
        timerRef.current = timer
      },
      onSuccess(user) {
        console.log('扫码完成', user)
        // onSuccess && onSuccess(user as User)
      },
      onError: (message) => {
        // config.qrCodeScanOptions?.onError?.(message)
        // onFail && onFail(`${message}`)
        console.log('扫码错误', message)
      },
    })
    return () => clearInterval(timerRef.current)
  }, [appQrcodeClient])

  return (
    <div className="authing-g2-login-app-qrcode">
      app qrcode
      <div id="authingGuardQrcode"></div>
    </div>
  )
}
