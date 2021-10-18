import React, { useEffect, useRef } from 'react'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithWechatMiniQrcodeProps {
  onLogin: any
  canLoop: boolean
}

export const LoginWithWechatMiniQrcode = (
  props: LoginWithWechatMiniQrcodeProps
) => {
  const timerRef = useRef<any>()
  const client = useAuthClient()
  const appQrcodeClient = client.wxqrcode

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!props.canLoop) {
      return
    }
    appQrcodeClient.startScanning('authingGuardMiniQrcode', {
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
  }, [appQrcodeClient, props.canLoop])

  return (
    <div className="authing-g2-login-app-qrcode">
      <div id="authingGuardMiniQrcode"></div>
    </div>
  )
}
