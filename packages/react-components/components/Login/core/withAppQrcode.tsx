import React, { useEffect, useRef, useState } from 'react'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'
import { message } from 'antd'
import { useGuardFinallyConfig, useGuardHttpClient } from '../../_utils/context'
import { getGuardWindow } from '../../Guard/core/useAppendConfig'

interface LoginWithAppQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithAppQrcode = (props: LoginWithAppQrcodeProps) => {
  const timerRef = useRef<any>()
  const client = useGuardAuthClient()
  const [loading, setLoading] = useState(true)
  const appQrcodeClient = client.qrcode
  const { responseIntercept } = useGuardHttpClient()
  const config = useGuardFinallyConfig()
  useEffect(() => {
    const guardWindow = getGuardWindow()

    if (!guardWindow) return

    if (!!config?._qrCodeScanOptions) return

    const document = guardWindow.document

    if (!props.canLoop) {
      return () => clearInterval(timerRef.current)
    }
    setLoading(true)
    appQrcodeClient.startScanning('authingGuardAppQrcode', {
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
      {config._qrCodeScanOptions ? (
        <div className="qrcode">
          <img src={config._qrCodeScanOptions.appQrcode.qrcode} alt="" />
          <span>{props.qrCodeScanOptions.tips.title}</span>
        </div>
      ) : (
        <>
          {loading && <ShieldSpin />}
          <div id="authingGuardAppQrcode"></div>
        </>
      )}
    </div>
  )
}
