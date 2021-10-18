import React, { FC, useState } from 'react'
import { VerifyCodeInput } from '../../../../common/VerifyCodeInput'
export interface VerifyTotpFormProps {}

export const VerifyTotpForm: FC<VerifyTotpFormProps> = (props) => {
  const [MFACode, setMFACode] = useState(new Array(6).fill(''))
  return (
    <div>
      VerifyTotpForm
      <VerifyCodeInput verifyCode={MFACode} setVerifyCode={setMFACode} />
    </div>
  )
}
