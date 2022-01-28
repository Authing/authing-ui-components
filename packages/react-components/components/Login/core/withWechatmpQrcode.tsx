import React, { useEffect, useRef, useState } from 'react'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'

interface LoginWithWechatmpQrcodeProps {
  onLogin: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithWechatmpQrcode = (
  props: LoginWithWechatmpQrcodeProps
) => {
  const timerRef = useRef<any>()
  const client = useGuardAuthClient()
  const [loading, setLoading] = useState(true)

  const appQrcodeClient = client.wechatmpqrcode
  // const config = props.config

  const domId = `authingGuardMpQrcode-${props.qrCodeScanOptions.extIdpConnId}`

  useEffect(() => {
    if (!props.canLoop) {
      return
    }
    appQrcodeClient.startScanning(domId, {
      autoExchangeUserInfo: true,
      ...props.qrCodeScanOptions,

      onCodeShow() {
        setLoading(false)
      },
      // onCodeLoaded() {
      //   setLoading(false)
      // },
      onStart(timer) {
        timerRef.current = timer
      },
      onSuccess(user) {
        props.onLogin(200, user)
        // onSuccess && onSuccess(user as User)
      },
      onError: (message) => {
        // config.qrCodeScanOptions?.onError?.(message)
        // onFail && onFail(`${message}`)
      },
      onCodeLoadFailed: () => {
        setLoading(false)
      },
      onRetry: () => {
        setLoading(true)
      },
      onMfa: (code, message, mfaData) => {
        props.onLogin(code, mfaData, message)
      },
    })
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appQrcodeClient, props.canLoop, props.qrCodeScanOptions])

  return (
    <div className="authing-g2-login-app-qrcode">
      {loading && <ShieldSpin />}
      <div id={domId}></div>
    </div>
  )
}
