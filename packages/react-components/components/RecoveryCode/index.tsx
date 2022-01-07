import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GuardModuleType, User } from '..'
import { useGuardAuthClient } from '../Guard/authClient'
import { IconFont } from '../IconFont'
import { MFAType } from '../MFA/interface'
import { SaveCode } from './core/saveCode'
import { UseCode } from './core/useCode'
import { GuardRecoveryCodeViewProps } from './interface'
import './style.less'

export const GuardRecoveryCodeView: React.FC<GuardRecoveryCodeViewProps> = ({
  initData,
  onLogin,
  __changeModule,
}) => {
  const onBack = () =>
    __changeModule?.(GuardModuleType.MFA, { current: MFAType.TOTP })
  const { t } = useTranslation()
  const [user, setUser] = useState<User>()
  const [code, setCode] = useState<string>()
  const authClient = useGuardAuthClient()

  const onBind = () => {
    if (user) onLogin?.(user, authClient)
  }
  return (
    <div className="g2-view-container g2-mfa-recovery-code">
      <div className="g2-view-back" style={{ display: 'inherit' }}>
        <span onClick={onBack} className="g2-view-mfa-back-hover">
          <IconFont type="authing-arrow-left-s-line" style={{ fontSize: 24 }} />
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
