import React, { FC, useRef, useState } from 'react'
import { useGuardContext } from '../../../context/global/context'
import { CheckEmailForm } from './CheckEmailForm'
import { VerifyCodeForm } from './VerifyCodeForm'
import { SmsMFAFormProps } from '../../types'

export const EmailMfaVerifyForm: FC<SmsMFAFormProps> = ({
  onSuccess,
  onFail,
}) => {
  const {
    state: {
      mfaData: { mfaToken, email: userEmail },
    },
  } = useGuardContext()
  const [email, setEmail] = useState(userEmail)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {email ? (
        <VerifyCodeForm
          sendCodeRef={sendCodeRef}
          onSuccess={onSuccess}
          onFail={onFail}
          email={email!}
          mfaToken={mfaToken}
        ></VerifyCodeForm>
      ) : (
        <CheckEmailForm
          mfaToken={mfaToken}
          onSuccess={(email) => {
            setEmail(email)
            sendCodeRef.current?.click()
          }}
        ></CheckEmailForm>
      )}
    </>
  )
}
