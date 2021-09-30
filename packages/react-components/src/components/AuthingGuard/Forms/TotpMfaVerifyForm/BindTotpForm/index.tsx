import React, { FC, useEffect } from 'react'
import { useGuardContext } from 'src/context/global/context'

export interface BindTotpFormProps {}

export const BindTotpForm: FC<BindTotpFormProps> = ({}) => {
  const { setValue } = useGuardContext()

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

  return <div>BindTotpForm</div>
}
