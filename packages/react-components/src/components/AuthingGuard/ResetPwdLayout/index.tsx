import React from 'react'

import { useGuardContext } from '../../../context/global/context'
import { ResetPasswordForm } from '../../../components/AuthingGuard/Forms'

export const ResetPwdLayout = () => {
  const {
    state: { guardEvents, authClient },
  } = useGuardContext()

  const onFail = (error: any) => {
    guardEvents.onPwdResetError?.(error, authClient)
  }

  const onSuccess = () => {
    guardEvents.onPwdReset?.(authClient)
  }

  return <ResetPasswordForm onFail={onFail} onSuccess={onSuccess} />
}
