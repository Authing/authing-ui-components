import { message } from 'antd'
import { User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'

import { Steps } from './Steps'
import {
  MfaResetCodeForm,
  MFAVerifyForm,
} from '../../../components/AuthingGuard/Forms'
import { useGuardContext } from '../../../context/global/context'

import './style.less'
import { useTranslation } from 'react-i18next'

export interface MfaLayoutProps {}

export const MfaLayout: FC<MfaLayoutProps> = () => {
  const { t } = useTranslation()
  const {
    state: { guardEvents, authClient },
  } = useGuardContext()

  const [step, setStep] = useState(Steps.Verify)

  const onSuccess = (user: User) => {
    message.success(t('common.LoginSuccess'))
    guardEvents.onLogin?.(user, authClient)
  }

  const onFail = (error: any) => {
    guardEvents.onLoginError?.(error, authClient)
  }

  const formProps = {
    onSuccess,
    onFail,
  }

  const formMap = {
    [Steps.Verify]: (
      <MFAVerifyForm {...formProps} goReset={() => setStep(Steps.Reset)} />
    ),
    [Steps.Reset]: (
      <MfaResetCodeForm {...formProps} goVerify={() => setStep(Steps.Verify)} />
    ),
  }

  return <div>{formMap[step]}</div>
}
