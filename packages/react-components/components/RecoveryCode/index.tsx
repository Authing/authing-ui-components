import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../IconFont'
import { UseCode } from './core/useCode'
import { GuardRecoveryCodeViewProps } from './interface'
import './style.less'
const window: Window = require('global/window')

export const GuardRecoveryCodeView: React.FC<GuardRecoveryCodeViewProps> = ({
  initData,
}) => {
  const onBack = () => window.history.back()
  const { t } = useTranslation()
  return (
    <div className="g2-view-container g2-mfa-recovery-code">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>{t('common.backToVerify')}</span>
        </span>
      </div>
      <div className="g2-mfa-content">
        <UseCode mfaToken={initData.mfaToken} />
      </div>
    </div>
  )
}
