import React, { FC, useRef, useState } from 'react'
import { useGuardContext } from 'src/context/global/context'
import { CheckPhoneForm } from './CheckPhoneForm'
import { VerifyCodeForm } from './VerifyCodeForm'
import { SmsMFAFormProps } from '../../types'

export const SmsMfaVerifyForm: FC<SmsMFAFormProps> = ({
  onSuccess,
  onFail,
}) => {
  const {
    state: {
      mfaData: { mfaToken, phone: userPhone },
    },
  } = useGuardContext()
  const [phone, setPhone] = useState(userPhone)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {phone ? (
        <VerifyCodeForm
          sendCodeRef={sendCodeRef}
          onSuccess={onSuccess}
          onFail={onFail}
          phone={phone!}
          mfaToken={mfaToken}
        ></VerifyCodeForm>
      ) : (
        <CheckPhoneForm
          mfaToken={mfaToken}
          onSuccess={(phone) => {
            setPhone(phone)
            sendCodeRef.current?.click()
          }}
        ></CheckPhoneForm>
      )}
    </>
  )
}
