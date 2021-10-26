import { User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'

import { MfaResetStep1 } from './Step1'
import { MfaResetStep2 } from './Step2'
import { useGuardContext } from '../../../context/global/context'
import { MfaResetForm } from '../../../../components/AuthingGuard/types'

import './style.less'
import { useTranslation } from 'react-i18next'

export const MfaResetCodeForm: FC<MfaResetForm> = ({
  goVerify,
  onSuccess,
  onFail,
}) => {
  const { t } = useTranslation()

  const {
    state: {
      mfaData: { mfaToken },
    },
  } = useGuardContext()

  const [step, setStep] = useState(1)
  const [user, setUser] = useState<User | null>(null)
  const [recoverCode, setRecoverCode] = useState('')

  const onReset = (
    user: User & {
      recoveryCode: string
    }
  ) => {
    setStep(2)
    setUser(user)
    setRecoverCode(user.recoveryCode)
  }

  const stepMap: Record<number, JSX.Element | undefined> = {
    1: (
      <MfaResetStep1
        onFail={onFail}
        goVerify={goVerify}
        onSuccess={onReset}
        mfaToken={mfaToken}
      />
    ),
    2: (
      <MfaResetStep2
        onFinish={() => onSuccess?.(user!)}
        recoverCode={recoverCode}
      />
    ),
  }

  return (
    <>
      <h2 className="authing-guard-mfa-reset-title">
        {t('common.useRecoverCode')}
      </h2>
      <p className="authing-guard-mfa-reset-tips">{t('login.mfaAfterReset')}</p>
      {stepMap[step]}
    </>
  )
}
