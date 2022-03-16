import React, { useEffect, useRef, useState } from 'react'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'

interface LoginWithAppQrcodeProps {
  onLogin: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithAppQrcode = (props: LoginWithAppQrcodeProps) => {
  const timerRef = useRef<any>()
  const client = useGuardAuthClient()
  const [loading, setLoading] = useState(true)
  const appQrcodeClient = client.qrcode

  useEffect(() => {
    if (!props.canLoop) {
      return
    }
    setLoading(true)
    appQrcodeClient.startScanning('authingGuardAppQrcode', {
      autoExchangeUserInfo: true,
      ...props.qrCodeScanOptions,
      onCodeShow() {
        setLoading(false)
      },
      onStart(timer) {
        timerRef.current = timer
      },
      onSuccess(user) {
        props.onLogin(200, user)
      },
      onCodeLoadFailed: () => {
        setLoading(false)
      },
      onRetry: () => {
        setLoading(true)
      },
    })
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appQrcodeClient, props.canLoop, props.qrCodeScanOptions])

  return (
    <div className="authing-g2-login-app-qrcode">
      {loading && <ShieldSpin />}
      <div id="authingGuardAppQrcode"></div>
    </div>
  )
}
