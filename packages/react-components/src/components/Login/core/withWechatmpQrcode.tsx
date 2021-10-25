import React, { useEffect, useRef } from 'react'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithWechatmpQrcodeProps {
  onLogin: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithWechatmpQrcode = (
  props: LoginWithWechatmpQrcodeProps
) => {
  const timerRef = useRef<any>()
  const client = useAuthClient()
  const appQrcodeClient = client.wechatmpqrcode
  // const config = props.config

  useEffect(() => {
    if (!props.canLoop) {
      return
    }
    appQrcodeClient.startScanning('authingGuardMpQrcode', {
      autoExchangeUserInfo: true,
      ...props.qrCodeScanOptions,
      onStart(timer) {
        // console.log('开始扫码')
        timerRef.current = timer
      },
      onSuccess(user) {
        props.onLogin(200, user)
        // onSuccess && onSuccess(user as User)
      },
      onError: (message) => {
        // config.qrCodeScanOptions?.onError?.(message)
        // onFail && onFail(`${message}`)
        console.log('扫码错误', message)
      },
    })
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appQrcodeClient, props.canLoop, props.qrCodeScanOptions])

  return (
    <div className="authing-g2-login-app-qrcode">
      <div id="authingGuardMpQrcode"></div>
    </div>
  )
}
