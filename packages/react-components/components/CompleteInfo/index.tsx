import React from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePro } from '../ImagePro'
import { GuardModuleType } from '../Guard/module'
import { CompleteInfo } from './core/completeInfo'
import { GuardCompleteInfoViewProps } from './interface'
import './styles.less'
import { IconFont } from '../IconFont'
import { useGuardAuthClient } from '../Guard/authClient'
import { useGuardPublicConfig } from '../_utils/context'

export const GuardCompleteInfoView: React.FC<GuardCompleteInfoViewProps> = ({
  config,
  onRegisterInfoCompleted,
  onRegisterInfoCompletedError,
  __changeModule,
  initData,
  onLogin,
}) => {
  const { t } = useTranslation()

  const authClient = useGuardAuthClient()

  const user = initData.user

  const publicConfig = useGuardPublicConfig()

  const skipComplateFileds = publicConfig?.skipComplateFileds ?? false

  const onSuccess = (
    udfs: {
      definition: any
      value: any
    }[]
  ) => {
    onRegisterInfoCompleted?.(user, udfs, authClient)
    if (initData.context === 'register') {
      __changeModule?.(GuardModuleType.LOGIN, {})
    } else {
      onLogin(user)
    }
  }

  return (
    <div className="g2-view-container g2-complete-info">
      <div className="g2-view-header">
        <div className="g2-completeInfo-header">
          <ImagePro
            src={config?.logo}
            size={48}
            borderRadius={4}
            alt=""
            className="icon"
          />

          {skipComplateFileds && (
            <span
              className="g2-completeInfo-header-skip"
              onClick={() => onSuccess([])}
            >
              <IconFont type="authing-a-share-forward-line1" />
              <span>{t('common.skip')}</span>
            </span>
          )}
        </div>

        <div className="title">{t('common.perfectUserInfo')}</div>
        <div className="title-explain">
          {t('common.welcomeDoc', { name: config.title })}
        </div>
      </div>
      <div className="g2-view-tabs g2-completeInfo-content">
        <CompleteInfo
          extendsFields={publicConfig?.extendsFields!}
          verifyCodeLength={publicConfig?.verifyCodeLength}
          user={initData?.user}
          onRegisterInfoCompleted={(_, udfs) => {
            onSuccess(udfs)
          }}
          onRegisterInfoCompletedError={onRegisterInfoCompletedError}
        />
      </div>
    </div>
  )
}
