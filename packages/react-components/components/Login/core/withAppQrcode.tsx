import { QrCode } from '../../Qrcode'
import React, { useRef } from 'react'
import { CodeStatus } from '../../Qrcode/UiQrCode'
import { QrCodeResponse } from '../../Qrcode/hooks/usePostQrCode'
import { message } from 'antd'
import { useGuardHttpClient } from '../../_utils/context'
import { WorkQrCodeRef } from '../../Qrcode/WorkQrCode'
import { useTranslation } from 'react-i18next'

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

  const { t } = useTranslation()

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
    if (codeRef.current) {
      codeRef.current.referQrCode()
    }
  }

  return (
    <QrCode
      ref={codeRef}
      scene="APP_AUTH"
      descriptions={{
        already: (referQrCode) => (
          <span onClick={referQrCode}>{t('login.appScanLogin')}</span>
        ),
        ready: t('login.appScanLogin'),
        success: t('common.LoginSuccess'),
        MFA: t('common.LoginSuccess'),
      }}
      onStatusChange={onStatusChange}
      imageStyle={{
        height: '200px',
        width: '200px',
      }}
    />
  )
}
