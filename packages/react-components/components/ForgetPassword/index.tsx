import React from 'react'
import { useTranslation } from 'react-i18next'
import { message } from 'antd'

import { GuardModuleType } from '../Guard/module'
import { ResetPassword } from './core/resetPassword'

import { ImagePro } from '../ImagePro'
import { useGuardAuthClient } from '../Guard/authClient'
import { CommonMessage } from '..'
import {
  useGuardEvents,
  useGuardFinallyConfig,
  useGuardModule,
  useGuardPublicConfig,
} from '../_utils/context'
// import { ChangeLanguage } from '../ChangeLanguage'

export const GuardForgetPassword: React.FC = () => {
  const { t } = useTranslation()

  const events = useGuardEvents()

  const publicConfig = useGuardPublicConfig()

  const authClient = useGuardAuthClient()

  const config = useGuardFinallyConfig()

  const { changeModule } = useGuardModule()

  const onReset = (res: any) => {
    let code = res.code
    if (code !== 200) {
      events?.onPwdResetError?.(res, authClient)
      message.error(res.message)
      return
    }
    events?.onPwdReset?.(authClient)
    // 返回登录
    const initData = {
      title: t('common.resetSuccess'),
      message: t('common.resetSuccessMessage'),
    }
    changeModule?.(GuardModuleType.SUBMIT_SUCCESS, {
      ...initData,
    })
  }

  const onSend = (type: 'phone' | 'email') => {
    if (type === 'phone') events?.onPwdPhoneSend?.(authClient)
    if (type === 'email') events?.onPwdEmailSend?.(authClient)
  }
  const onSendError = (type: 'phone' | 'email', error: any) => {
    if (type === 'phone')
      events?.onPwdPhoneSendError?.(error as CommonMessage, authClient)
    if (type === 'email')
      events?.onPwdEmailSendError?.(error as CommonMessage, authClient)
  }

  return (
    <div className="g2-view-container g2-forget-password">
      <div className="g2-view-header">
        <ImagePro
          src={config?.logo!}
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
          onClick={() => changeModule?.(GuardModuleType.LOGIN)}
        >
          {t('common.backLoginPage')}
        </div>
      </div>
      {/* <ChangeLanguage langRange={langRange} onLangChange={props.onLangChange} /> */}
    </div>
  )
}
