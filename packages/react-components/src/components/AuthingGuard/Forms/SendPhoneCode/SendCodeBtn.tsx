import React, { FC, useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const TIME = 60
export interface SendCodeProps {
  beforeSend: () => Promise<boolean>
  btnRef?: React.RefObject<HTMLButtonElement>
}

const useSentCounter = () => {
  const [countDown, setCountDown] = useState(0)
  const timerRef = useRef<any>(0)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (countDown <= 0) {
      clearInterval(timerRef.current)
    }
  }, [countDown])

  const enabled = useMemo(() => countDown <= 0, [countDown])

  const send = () => {
    setCountDown(TIME)

    timerRef.current = setInterval(() => {
      setCountDown((prev) => {
        return prev - 1
      })
    }, 1000)
  }

  return {
    enabled,
    send,
    countDown,
  }
}

export const SendCodeBtn: FC<SendCodeProps> = ({ beforeSend, btnRef }) => {
  const { enabled, send, countDown } = useSentCounter()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const disabled = useMemo(() => {
    return !enabled || loading
  }, [enabled, loading])

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true)
    if (disabled) {
      return
    }

    if (!(await beforeSend())) {
      setLoading(false)
      return
    }
    setLoading(false)
    send()
  }

  return (
    <button
      type="button"
      className="authing-send-code-btn"
      disabled={disabled}
      onClick={onClick}
      ref={btnRef}
    >
      {enabled
        ? t('common.sendVerifyCode')
        : t('common.retryAfterTime', {
            tiem: countDown,
          })}
    </button>
  )
}
