import React, { useEffect, useRef, useState } from 'react'
import { message } from 'antd'
import { ShieldSpin } from '../../ShieldSpin'
import { useGuardAuthClient } from '../../Guard/authClient'
import { useGuardFinallyConfig, useGuardHttpClient } from '../../_utils/context'
import { getGuardWindow } from '../../Guard/core/useAppendConfig'
import { QrCode } from '../../Qrcode'

interface LoginWithWechatMiniQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithWechatMiniQrcode = (
  props: LoginWithWechatMiniQrcodeProps
) => {
  const { canLoop } = props

  if (!canLoop) {
    return null
  }

  // useEffect(() => {
  //   const guardWindow = getGuardWindow()
  //   if (!guardWindow) return

  //   if (!!config._qrCodeScanOptions) return

  //   const document = guardWindow.document

  //   if (!props.canLoop) {
  //     return () => clearInterval(timerRef.current)
  //   }

  //   setLoading(true)

  //   appQrcodeClient.startScanning(domId, {
  //     currentDocument: document,
  //     autoExchangeUserInfo: true,
  //     ...props.qrCodeScanOptions,
  //     onCodeShow() {
  //       setLoading(false)
  //     },
  //     onStart(timer) {
  //       timerRef.current = timer
  //     },
  //     onSuccess(user) {
  //       // props.onLogin(200, user)
  //       clearInterval(timerRef.current)
  //       props.onLoginSuccess(user)
  //     },
  //     onError: (ms) => {
  //       if (ms) {
  //         message.error(ms)
  //       }
  //     },
  //     onCodeLoadFailed: ({ message: mes }: any) => {
  //       message.error(JSON.parse(mes).message)
  //       setLoading(false)
  //     },
  //     onRetry: () => {
  //       setLoading(true)
  //     },
  //     onAuthFlow: (scannedResult) => {
  //       clearInterval(timerRef.current)
  //       const { onGuardHandling } = responseIntercept(scannedResult)
  //       onGuardHandling?.()
  //     },
  //   })
  //   return () => clearInterval(timerRef.current)

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [appQrcodeClient, props.canLoop])
  const { qrCodeScanOptions } = props

  const onStatusChange = () => {
    //
  }

  return (
    <QrCode
      genRequestParams={qrCodeScanOptions}
      scene="WXAPP_AUTH"
      descriptions={{
        error: '糟糕，发生错误了',
        ready: '准备好了，扫码吧',
        already: '请确认',
        success: '成功!',
        expired: '被取消了哦',
        MFA: 'MFA 提示的文字',
      }}
      onStatusChange={onStatusChange}
      imageStyle={{
        height: '200px',
        width: '200px',
      }}
    />
  )
}
