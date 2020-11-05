import React from 'react'

import { useGuardContext } from '@/context/global/context'
import { GuardState } from '@/components/AuthingGuard/types'
import { GuardHeader } from '@/components/AuthingGuard/Header'
import { LoginLayout } from '@/components/AuthingGuard/LoginLayout'
import { RegisterLayout } from '@/components/AuthingGuard/RegisterLayout'

import './style.less'

export const GuardLayout = () => {
  const {
    state: { guardState },
  } = useGuardContext()

  const layoutMap = {
    [GuardState.Login]: <LoginLayout />,
    [GuardState.Register]: <RegisterLayout />,
    [GuardState.RestPassword]: '重置密码',
    [GuardState.Mfa]: 'MFA',
  }
  return (
    <div className="authing-guard-layout">
      <div className="authing-guard-container">
        <GuardHeader />
        {layoutMap[guardState]}
      </div>
    </div>
  )
}
