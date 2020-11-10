import { useGuardContext } from '../../../../context/global/context'
import React, { FC, useEffect, useRef, useState } from 'react'

import { GuardScenes } from '../../../../components/AuthingGuard/types'

const TIME = 3
export const ResetPasswordStep4: FC = () => {
  const [countDown, setCountDown] = useState(TIME)
  const timerRef = useRef<any>(0)

  const { setValue } = useGuardContext()

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountDown((prev) => {
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (countDown <= 0) {
      clearInterval(timerRef.current)

      setValue('guardScenes', GuardScenes.Login)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countDown])

  return (
    <div style={{ textAlign: 'center' }}>
      <h3
        style={{
          fontSize: 20,
          fontFamily: 'PingFangSC-Medium',
          marginBottom: 0,
        }}
      >
        密码修改成功
      </h3>
      <p style={{ fontSize: 12 }}>{countDown}s 后自动跳转登录</p>
    </div>
  )
}
