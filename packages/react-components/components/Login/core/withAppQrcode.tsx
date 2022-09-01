import { QrCode } from '../../Qrcode'
import React, { useRef } from 'react'
import { CodeStatus } from '../../Qrcode/UiQrCode'
import { QrCodeResponse } from '../../Qrcode/hooks/usePostQrCode'
import { message } from 'antd'
import { useGuardHttpClient } from '../../_utils/context'
import { WorkQrCodeRef } from '../../Qrcode/WorkQrCode'
import { useTranslation } from 'react-i18next'
import { StoreInstance } from '../../Guard/core/hooks/useMultipleAccounts'
import { LoginMethods } from '../..'

interface LoginWithAppQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  // qrCodeScanOptions: any
  multipleInstance?: StoreInstance
}

export const LoginWithAppQrcode = (props: LoginWithAppQrcodeProps) => {
  const codeRef = useRef<WorkQrCodeRef>()

  const { canLoop } = props

  const { responseIntercept } = useGuardHttpClient()

  const { t } = useTranslation()

  if (!canLoop) {
    return null
  }

  const descriptions = {
    already: (referQrCode: () => void) => (
      <span className="qrcode__again-scan" onClick={referQrCode}>
        {t('login.scanAgain')}
      </span>
    ),
    ready: t('login.appScanLogin'),
    success: t('common.LoginSuccess'),
    MFA: t('common.LoginSuccess'),
  }

  /**
   * Sever Status 发生变化
   * @param status
   * @param data
   */
  const onStatusChange = (status: CodeStatus, data: QrCodeResponse) => {
    switch (status) {
      case 'success':
        props.multipleInstance &&
          props.multipleInstance.setLoginWay('qrcode', LoginMethods.AppQr)
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

  return (
    <QrCode
      ref={codeRef}
      scene="MOBILE_APP"
      descriptions={descriptions}
      onStatusChange={onStatusChange}
      imageStyle={{
        height: '166px',
        width: '166px',
      }}
    />
  )
}
