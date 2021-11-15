import React from 'react'
import { useTranslation } from 'react-i18next'
import { message } from 'antd'

import { GuardModuleType } from '../Guard/module'
import { ResetPassword } from './core/resetPassword'

import { ImagePro } from '../ImagePro'
import { ForgetPasswordViewProps } from './interface'
import { useAuthClient } from '../Guard/authClient'
import { CommonMessage } from '..'

export const GuardForgetPassword: React.FC<ForgetPasswordViewProps> = (
  props
) => {
  const { t } = useTranslation()
  let publicConfig = props.config.__publicConfig__
  const authClient = useAuthClient()

  const onReset = (res: any) => {
    let code = res.code
    if (code !== 200) {
      props.onPwdResetError?.(res, authClient)
      message.error(res.message)
      return
    }
    props.onPwdReset?.(authClient)
    // 返回登录
    const initData = {
      title: t('common.resetSuccess'),
      message: t('common.resetSuccessMessage'),
    }
    props.__changeModule?.(GuardModuleType.SUBMIT_SUCCESS, { ...initData })
  }

  const onSend = (type: 'phone' | 'email') => {
    if (type === 'phone') props.onPwdPhoneSend?.(authClient)
    if (type === 'email') props.onPwdEmailSend?.(authClient)
  }
  const onSendError = (type: 'phone' | 'email', error: any) => {
    if (type === 'phone')
      props.onPwdPhoneSendError?.(error as CommonMessage, authClient)
    if (type === 'email')
      props.onPwdEmailSendError?.(error as CommonMessage, authClient)
  }

  return (
    <div className="g2-view-container">
      <div className="g2-view-header">
        <ImagePro
          src={props.config?.logo}
          size={48}
          borderRadius={4}
          alt=""
          className="icon"
        />
        <div className="title">{t('login.resetPwd')}</div>
        <div className="title-explain">{t('user.resetpasswordText1')}</div>
      </div>
      <div className="g2-view-tabs">
        <ResetPassword
          onReset={onReset}
          publicConfig={publicConfig}
          onSend={onSend}
          onSendError={onSendError}
        />
      </div>
      <div className="g2-tips-line">
        <div
          className="link-like back-to-login"
          onClick={() => props.__changeModule?.(GuardModuleType.LOGIN)}
        >
          {t('common.backLoginPage')}
        </div>
      </div>
    </div>
  )
}
