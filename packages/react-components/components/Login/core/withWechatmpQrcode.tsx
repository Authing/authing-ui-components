import React from 'react'
import { useGuardHttpClient } from '../../_utils/context'
import { message } from 'antd'
import { QrCode } from '../../Qrcode'
import { CodeStatus } from '../../Qrcode/UiQrCode'
import { QrCodeResponse } from '../../Qrcode/hooks/usePostQrCode'
import { useTranslation } from 'react-i18next'
import { StoreInstance } from '../../Guard/core/hooks/useMultipleAccounts'
import { LoginMethods } from '../..'
import { isWeChatBrowser } from '../../_utils'
interface LoginWithWechatmpQrcodeProps {
  // onLogin: any
  onLoginSuccess: any
  canLoop: boolean
  qrCodeScanOptions: any
  // 当前登录方式 对应的id
  id: string
  /**
   * 多账号存储实例
   */
  multipleInstance?: StoreInstance
}

export const LoginWithWechatmpQrcode = (
  props: LoginWithWechatmpQrcodeProps
) => {
  const { canLoop, qrCodeScanOptions } = props

  const { t } = useTranslation()

  const { responseIntercept } = useGuardHttpClient()

  if (!canLoop) {
    return null
  }

  const descriptions = {
    ready: isWeChatBrowser()
      ? t('common.loginWithWechatmpQrcodeTipsTitle')
      : t('login.wechatScanLogin'),
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
        props.multipleInstance &&
          props.multipleInstance.setLoginWay(
            'qrcode',
            LoginMethods.WechatMpQrcode,
            props.id
          )

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
      scene="WECHATMP_AUTH"
      descriptions={descriptions}
      onStatusChange={onStatusChange}
      qrCodeScanOptions={qrCodeScanOptions}
      imageStyle={{
        height: '166px',
        width: '166px',
      }}
    />
  )
}
