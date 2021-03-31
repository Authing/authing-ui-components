import { useGuardContext } from '../../../../context/global/context'
import React, { FC, useEffect, useRef, useState } from 'react'

import { GuardScenes } from '../../../../components/AuthingGuard/types'
import { useTranslation } from 'react-i18next'

const TIME = 3
export const ResetPasswordStep4: FC = () => {
  const [countDown, setCountDown] = useState(TIME)
  const timerRef = useRef<any>(0)
  const { t } = useTranslation()
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
        {t('common.pwdModifySuccess')}
      </h3>
      <p style={{ fontSize: 12 }}>
        {t('common.jumpAfterCount', {
          number: countDown,
        })}
      </p>
    </div>
  )
}
