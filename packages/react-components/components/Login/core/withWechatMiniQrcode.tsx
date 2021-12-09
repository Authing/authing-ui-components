import React, { useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { ShieldSpin } from '../../ShieldSpin'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithWechatMiniQrcodeProps {
  onLogin: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithWechatMiniQrcode = (
  props: LoginWithWechatMiniQrcodeProps
) => {
  const timerRef = useRef<any>()
  const client = useAuthClient()
  const [loading, setLoading] = useState(true)
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
      ...props.qrCodeScanOptions,

      onCodeLoaded() {
        setLoading(false)
      },
      onStart(timer) {
        setLoading(true)
        // console.log('开始扫码')
        timerRef.current = timer
      },
      onSuccess(user) {
        // console.log('扫码完成', user)
        // onSuccess && onSuccess(user as User)
        props.onLogin(200, user)
      },
      onError: (ms) => {
        // config.qrCodeScanOptions?.onError?.(message)
        // onFail && onFail(`${message}`)
        message.error(ms)
      },
      onCodeLoadFailed: (error: any) => {
        message.error(error.message)
        setLoading(false)
      },
      onRetry: () => {
        setLoading(true)
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appQrcodeClient, props.canLoop, props.qrCodeScanOptions])

  return (
    <div className="authing-g2-login-app-qrcode">
      {loading && <ShieldSpin />}
      <div id="authingGuardMiniQrcode"></div>
    </div>
  )
}
