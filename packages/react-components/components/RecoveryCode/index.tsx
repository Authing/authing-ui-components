import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User } from '..'
import { useGuardAuthClient } from '../Guard/authClient'
import { IconFont } from '../IconFont'
import { SaveCode } from './core/saveCode'
import { UseCode } from './core/useCode'
import { GuardRecoveryCodeViewProps } from './interface'
import './style.less'

export const GuardRecoveryCodeView: React.FC<GuardRecoveryCodeViewProps> = ({
  initData,
  onLogin,
}) => {
  const onBack = () => window.history.back()
  const { t } = useTranslation()
  const [user, setUser] = useState<User>()
  const [code, setCode] = useState<string>()
  const authClient = useGuardAuthClient()

  const onBind = () => {
    if (user) onLogin?.(user, authClient)
  }
  return (
    <div className="g2-view-container g2-mfa-recovery-code">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>{t('common.backToVerify')}</span>
        </span>
      </div>
      <div className="g2-mfa-content">
        {user && code ? (
          <SaveCode secret={code} onBind={onBind} />
        ) : (
          <UseCode
            mfaToken={initData.mfaToken}
            onSubmit={(code, user) => {
              setUser(user)
              setCode(code)
            }}
          />
        )}
      </div>
    </div>
  )
}
