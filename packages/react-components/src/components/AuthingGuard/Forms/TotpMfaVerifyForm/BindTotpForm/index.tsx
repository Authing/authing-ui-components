import React, { FC, useEffect } from 'react'
import { useGuardContext } from 'src/context/global/context'
import { useMediaSize } from 'src/components/AuthingGuard/hooks'

export interface BindTotpFormProps {}

export const BindTotpForm: FC<BindTotpFormProps> = (props) => {
  const { setValue } = useGuardContext()
  // 判断是否移动端
  const { isPhoneMedia } = useMediaSize()

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

  console.log(isPhoneMedia)

  return (
    <div>
      <div>MFA 绑定</div>
      <div>内容</div>
    </div>
  )
}
