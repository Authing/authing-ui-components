import { message } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
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

  const { t } = useTranslation()

  const { responseIntercept } = useGuardHttpClient()

  if (!canLoop) {
    return null
  }

  const descriptions = {
    ready: t('login.wechatScanLogin'),
    success: t('common.LoginSuccess'),
    MFA: t('common.LoginSuccess'),
  }

  /**
   * 状态发生变化时的处理函数
   * @param status
   * @param data
   */
  const onStatusChange = (status: CodeStatus, data: QrCodeResponse) => {
    switch (status) {
      case 'success':
        props.onLoginSuccess(data)
        break
      case 'error':
        // 怎么模拟这里的 error
        if (data.scannedResult) {
          const { message: msg } = data.scannedResult
          message.error(msg)
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
      descriptions={descriptions}
      onStatusChange={onStatusChange}
      imageStyle={{
        height: '172px',
        width: '172px',
      }}
    />
  )
}
