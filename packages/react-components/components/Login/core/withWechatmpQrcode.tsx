import React, { useEffect, useRef, useState } from 'react'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'
import { useGuardFinallyConfig, useGuardHttpClient } from '../../_utils/context'
import { message } from 'antd'
import { getGuardWindow } from '../../Guard/core/useAppendConfig'

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

  const config = useGuardFinallyConfig()

  useEffect(() => {
    const guardWindow = getGuardWindow()

    if (!guardWindow) return

    if (!!config._qrCodeScanOptions) return

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
        props.onLoginSuccess(user)
        clearInterval(timerRef.current)
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
        // props.onLogin(code, mfaData, message)
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
          <img src={config._qrCodeScanOptions.wechatmpQrcode.qrcode} alt="" />
          <span>{props.qrCodeScanOptions.tips.title}</span>
        </div>
      ) : (
        <>
          {loading && <ShieldSpin />}
          <div id={domId}></div>
        </>
      )}
    </div>
  )
}
