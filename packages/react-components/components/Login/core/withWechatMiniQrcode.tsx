import React, { useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'

interface LoginWithWechatMiniQrcodeProps {
  onLogin: any
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

  const domId = `authingGuardMiniQrcode-${props.qrCodeScanOptions.extIdpConnId}`

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
      onStart(timer) {
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
      onCodeLoadFailed: ({ message: mes }: any) => {
        message.error(JSON.parse(mes).message)
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
      <div id={domId}></div>
    </div>
  )
}
