import React from 'react'
import { useTranslation } from 'react-i18next'

import { GuardModuleType } from '../Guard'
import { SelfUnlock } from './core/selfUnlock'

import { ImagePro } from '../ImagePro'
import { useGuardFinallyConfig, useGuardModule } from '../_utils/context'

export const GuardUnlockView: React.FC = () => {
  const { t } = useTranslation()

  const config = useGuardFinallyConfig()

  const { changeModule } = useGuardModule()

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
        <SelfUnlock />
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
