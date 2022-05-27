import React from 'react'
import { useTranslation } from 'react-i18next'
import { message } from 'antd'

import { GuardModuleType } from '../Guard'
import { SelfUnlock } from './core/selfUnlock'

import { ImagePro } from '../ImagePro'
import { useGuardAuthClient } from '../Guard/authClient'
import { CommonMessage } from '..'
import {
  useGuardEvents,
  useGuardFinallyConfig,
  useGuardInitData,
  useGuardModule,
  useGuardPublicConfig,
} from '../_utils/context'
// import { ChangeLanguage } from '../ChangeLanguage'

export const GuardUnlockView: React.FC = () => {
  const { t } = useTranslation()

  const initData = useGuardInitData<{
    defaultEmail: 'string'
    defaultPhone: 'string'
  }>()
  const events = useGuardEvents()

  const publicConfig = useGuardPublicConfig()

  const authClient = useGuardAuthClient()

  const config = useGuardFinallyConfig()

  const { changeModule } = useGuardModule()

  const onReset = (res: any) => {
    let apiCode = res.apiCode
    if (apiCode !== 1600) {
      events?.onPwdResetError?.(res, authClient)
      message.error(res.message)
      return
    }
    events?.onLogin?.(res.data, authClient)
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
        <div className="title">{t('login.selfUnlock')}</div>
        <div className="title-explain">{t('login.selfUnlockText')}</div>
      </div>
      <div className="g2-view-tabs">
        <SelfUnlock
          initData={initData}
          onReset={onReset}
          publicConfig={publicConfig}
          onSend={onSend}
          onSendError={onSendError}
        />
      </div>
      <div className="g2-tips-line">
        <span>{t('user.unlockTip')} &nbsp;</span>
        <span
          className="link-like"
          onClick={() => changeModule?.(GuardModuleType.ANY_QUESTIONS)}
        >
          {t('common.feedback')}
        </span>
      </div>
      {/* <ChangeLanguage langRange={langRange} onLangChange={props.onLangChange} /> */}
    </div>
  )
}
