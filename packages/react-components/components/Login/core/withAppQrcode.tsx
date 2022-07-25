// import React, { useEffect, useRef, useState } from 'react'
// import { ShieldSpin } from '../../ShieldSpin'
// import { useGuardAuthClient } from '../../Guard/authClient'
// import { message } from 'antd'
// import { useGuardFinallyConfig, useGuardHttpClient } from '../../_utils/context'
// import { getGuardWindow } from '../../Guard/core/useAppendConfig'
import { QrCode } from '../../Qrcode'
// import { QrCodeResponse, useQrCode } from '../hooks/useQrCode'
// import { usePreQrCode } from '../hooks/usePreQrCode'
import React from 'react'
import { CodeStatus } from '../../Qrcode/UiQrCode'
import { QrCodeResponse } from '../../Qrcode/hooks/useQrCode'
import { message } from 'antd'
import { useGuardHttpClient } from '../../_utils/context'

interface LoginWithAppQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  qrCodeScanOptions: any
}

export const LoginWithAppQrcode = (props: LoginWithAppQrcodeProps) => {
  const { qrCodeScanOptions, canLoop } = props

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
        console.log(data, '返回的用户信息')
        props.onLoginSuccess(data)
        break
      case 'error':
        if (data) {
          message.error(data)
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
      genRequestParams={qrCodeScanOptions}
      scene="APP_AUTH"
      descriptions={{
        error: '糟糕，发生错误了',
        ready: '准备好了，扫码吧',
        already: '请确认',
        success: '成功!',
        expired: '被取消了哦',
        MFA: 'MFA 提示的文字',
      }}
      onStatusChange={onStatusChange}
    />
  )
}
