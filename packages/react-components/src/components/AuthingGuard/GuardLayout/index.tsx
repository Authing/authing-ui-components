import React from 'react'

import { useGuardContext } from '@/context/global/context'
import { GuardScenes } from '@/components/AuthingGuard/types'
import { GuardHeader } from '@/components/AuthingGuard/Header'
import { LoginLayout } from '@/components/AuthingGuard/LoginLayout'
import { RegisterLayout } from '@/components/AuthingGuard/RegisterLayout'

import './style.less'

export const GuardLayout = () => {
  const {
    state: { guardScenes },
  } = useGuardContext()

  const layoutMap = {
    [GuardScenes.Login]: <LoginLayout />,
    [GuardScenes.Register]: <RegisterLayout />,
    [GuardScenes.RestPassword]: '重置密码',
    [GuardScenes.Mfa]: 'MFA',
  }
  return (
    <div className="authing-guard-layout">
      <div className="authing-guard-container">
        <GuardHeader />
        {layoutMap[guardScenes]}
      </div>
    </div>
  )
}
