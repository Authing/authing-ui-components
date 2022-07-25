import React from 'react'
import { QrCode } from '../../Qrcode'
import { QrCodeResponse } from '../../Qrcode/hooks/usePostQrCode'
import { CodeStatus } from '../../Qrcode/UiQrCode'
import { useGuardHttpClient } from '../../_utils/context'

interface LoginWithWechatMiniQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  // qrCodeScanOptions: any
}

export const LoginWithWechatMiniQrcode = (
  props: LoginWithWechatMiniQrcodeProps
) => {
  const { canLoop } = props

  const { responseIntercept } = useGuardHttpClient()

  if (!canLoop) {
    return null
  }

  const onStatusChange = (status: CodeStatus, data: QrCodeResponse) => {
    switch (status) {
      case 'success':
        props.onLoginSuccess(data)
        break
      // 这里是 Error 的处理
      case 'error':
        if (data.scannedResult) {
          // const { errmsg } = data.scannedResult
          // message.error(errmsg)
        }
        break
      case 'MFA':
        const { onGuardHandling } = responseIntercept(data.scannedResult!)
        onGuardHandling?.()
        break
      default:
        break
    }
  }

  return (
    <QrCode
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
