import React from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePro } from '../ImagePro'
import { GuardModuleType } from '../Guard/module'
import { CompleteInfo } from './core/completeInfo'
import { GuardCompleteInfoViewProps } from './interface'
import './styles.less'

export const GuardCompleteInfoView: React.FC<GuardCompleteInfoViewProps> = ({
  config,
  onRegisterInfoCompleted,
  onRegisterInfoCompletedError,
  __changeModule,
  initData,
  onLogin,
}) => {
  const { t } = useTranslation()
  return (
    <div className="g2-view-container">
      <div className="g2-view-header">
        <ImagePro
          src={config?.logo}
          size={48}
          borderRadius={4}
          alt=""
          className="icon"
        />
        <div className="title">{t('common.perfectUserInfo')}</div>
        <div className="title-explain">
          {t('common.welcomeDoc', { name: config.title })}
        </div>
      </div>
      <div className="g2-view-tabs g2-completeInfo-content">
        <CompleteInfo
          extendsFields={config?.__publicConfig__?.extendsFields!}
          verifyCodeLength={config?.__publicConfig__?.verifyCodeLength}
          onRegisterInfoCompleted={(user, udfs, authClient) => {
            onRegisterInfoCompleted?.(user, udfs, authClient)
            if (initData.context === 'register') {
              __changeModule?.(GuardModuleType.LOGIN, {})
            } else {
              onLogin(user)
            }
          }}
          onRegisterInfoCompletedError={onRegisterInfoCompletedError}
        />
      </div>
    </div>
  )
}
