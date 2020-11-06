import React, { FC, useState } from 'react'
import {
  MfaResetCodeForm,
  MFAVerifyForm,
} from '@/components/AuthingGuard/Forms'
import { Steps } from './Steps'

import './style.less'
import { User } from 'authing-js-sdk'

export interface MfaLayoutProps {}

export const MfaLayout: FC<MfaLayoutProps> = () => {
  const [step, setStep] = useState(Steps.Verify)

  const onSuccess = (user: User) => {
    console.log('登录成功', user)
  }
  const onFail = (error: any) => {
    console.log('登录失败', error)
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
