import React, { FC, useEffect } from 'react'
import { useGuardContext } from 'src/context/global/context'
import { UserMfa, TotpSource } from '../UserMfa/'

export interface BindTotpFormProps {}

export const BindTotpForm: FC<BindTotpFormProps> = (props) => {
  const {
    state: { mfaData, userPoolId, appId },
    setValue,
  } = useGuardContext()

  const { state } = useGuardContext()

  console.log(state)

  // 略微调整一下 Layout
  useEffect(() => {
    setValue('guardSize', 'large')
    setValue('showHeader', false)
    setValue('showBottom', false)

    return () => {
      setValue('guardSize', 'middle')
      setValue('showHeader', true)
      setValue('showBottom', true)
    }
  }, [setValue])

  return (
    <UserMfa
      userpoolName={''}
      userPoolId={userPoolId}
      appId={appId}
      totpSource={TotpSource.APPLICATION}
      MFAToken={mfaData.mfaToken as string}
    />
  )
}
