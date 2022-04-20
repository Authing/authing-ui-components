import React, { useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'
import { useGuardHttpClient } from '../../_utils/context'
import { getGuardWindow } from '../../Guard/core/useAppendConfig'

interface LoginWithWechatMiniQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithWechatMiniQrcode = (
  props: LoginWithWechatMiniQrcodeProps
) => {
  const timerRef = useRef<any>()
  const client = useGuardAuthClient()
  const [loading, setLoading] = useState(true)
  const appQrcodeClient = client.wxqrcode
  const { responseIntercept } = useGuardHttpClient()

  const domId = `authingGuardMiniQrcode-${props.qrCodeScanOptions.extIdpConnId}`

  useEffect(() => {
    const guardWindow = getGuardWindow()

    if (!guardWindow) return

    const document = guardWindow.document

    if (!props.canLoop) {
      return () => clearInterval(timerRef.current)
    }

    setLoading(true)

    appQrcodeClient.startScanning(domId, {
      currentDocument: document,
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
        clearInterval(timerRef.current)
        props.onLoginSuccess(user)
      },
      onError: (ms) => {
        if (ms) {
          message.error(ms)
        }
      },
      onCodeLoadFailed: ({ message: mes }: any) => {
        message.error(JSON.parse(mes).message)
        setLoading(false)
      },
      onRetry: () => {
        setLoading(true)
      },
      onAuthFlow: (scannedResult) => {
        clearInterval(timerRef.current)
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
