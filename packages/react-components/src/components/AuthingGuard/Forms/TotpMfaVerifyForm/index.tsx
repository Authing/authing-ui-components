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

  // 如果绑定直接验证
  // 如果没有绑定进入绑定的页面
  return <>{bindTotp ? <VerifyTotpForm /> : <BindTotpForm />}</>
}
