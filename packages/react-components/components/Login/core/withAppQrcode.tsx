import { QrCode } from '../../Qrcode'
import React, { useRef } from 'react'
import { CodeStatus } from '../../Qrcode/UiQrCode'
import { QrCodeResponse } from '../../Qrcode/hooks/usePostQrCode'
import { message } from 'antd'
import { useGuardHttpClient } from '../../_utils/context'
import { WorkQrCodeRef } from '../../Qrcode/WorkQrCode'

interface LoginWithAppQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  // qrCodeScanOptions: any
}

export const LoginWithAppQrcode = (props: LoginWithAppQrcodeProps) => {
  const codeRef = useRef<WorkQrCodeRef>()

  const { canLoop } = props

  const { responseIntercept } = useGuardHttpClient()

  if (!canLoop) {
    return null
  }

  /**
   * Sever Status 发生变化
   * @param status
   * @param data
   */
  const onStatusChange = (status: CodeStatus, data: QrCodeResponse) => {
    switch (status) {
      case 'success':
        props.onLoginSuccess(data)
        break
      case 'error':
        if (data.scannedResult) {
          const { message: msg } = data.scannedResult
          message.error(msg)
        }
        break
      case 'MFA':
        if (data.scannedResult) {
          const { onGuardHandling } = responseIntercept(data.scannedResult)
          onGuardHandling?.()
        }
        break
      default:
        break
    }
  }

  /**
   * 点击刷新二维码
   */
  const onClickRefer = () => {
    console.log(codeRef.current, '点击')
    if (codeRef.current) {
      codeRef.current.referQrCode()
    }
  }

  return (
    <QrCode
      ref={codeRef}
      scene="APP_AUTH"
      descriptions={{
        error: '糟糕，发生错误了',
        ready: '扫码吧小伙子',
        already: (
          <>
            <span>准备好了，扫码吧</span>
            <a onClick={onClickRefer}>重新扫码</a>
          </>
        ),
        success: '成功!',
        expired: '被取消了哦',
        MFA: 'MFA 提示的文字',
      }}
      onStatusChange={onStatusChange}
    />
  )
}
