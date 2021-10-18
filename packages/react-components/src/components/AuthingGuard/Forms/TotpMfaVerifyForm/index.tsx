import React, { FC, useState } from 'react'
import { useGuardContext } from 'src/context/global/context'
import { TotpMFAFormProps } from '../../types'
import { BindTotpForm } from './BindTotpForm/index'
import { VerifyTotpForm } from './VerifyTotpForm'

export const TotpMfaVerifyForm: FC<TotpMFAFormProps> = ({
  onSuccess,
  onFail,
}) => {
  const {
    state: {
      mfaData: { totpMfaEnabled },
    },
  } = useGuardContext()

  // 判断是否绑定
  const [bindTotp] = useState<boolean>(totpMfaEnabled)

  return <>{bindTotp ? <VerifyTotpForm /> : <BindTotpForm />}</>
}
