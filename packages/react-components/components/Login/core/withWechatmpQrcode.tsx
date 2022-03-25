import React, { useEffect, useRef, useState } from 'react'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'
import { useGuardHttpClient } from '../../_utils/context'
import { message } from 'antd'

interface LoginWithWechatmpQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithWechatmpQrcode = (
  props: LoginWithWechatmpQrcodeProps
) => {
  const timerRef = useRef<any>()

  const client = useGuardAuthClient()

  const { responseIntercept } = useGuardHttpClient()

  const [loading, setLoading] = useState(true)

  const appQrcodeClient = client.wechatmpqrcode

  const domId = `authingGuardMpQrcode-${props.qrCodeScanOptions.extIdpConnId}`
  useEffect(() => {
    if (!props.canLoop) {
      return () => clearInterval(timerRef.current)
    }
    setLoading(true)
    appQrcodeClient.startScanning(domId, {
      autoExchangeUserInfo: true,
      ...props.qrCodeScanOptions,

      onCodeShow() {
        setLoading(false)
      },
      onStart(timer) {
        timerRef.current = timer
      },
      onSuccess(user) {
        // props.onLogin(200, user)
        props.onLoginSuccess(user)
      },
      onError: (ms) => {
        message.error(ms)
      },
      onCodeLoadFailed: ({ message: mes }: any) => {
        message.error(JSON.parse(mes).message)
        setLoading(false)
      },
      onRetry: () => {
        setLoading(true)
      },
      onAuthFlow: (scannedResult) => {
        // props.onLogin(code, mfaData, message)
        const { onGuardHandling } = responseIntercept(scannedResult)
        onGuardHandling?.()
      },
    })
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appQrcodeClient, props.canLoop])

  return (
    <div className="authing-g2-login-app-qrcode">
      {loading && <ShieldSpin />}
      <div id={domId}></div>
    </div>
  )
}
