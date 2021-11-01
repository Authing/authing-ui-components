import { Button } from 'antd'
import React, { FC, useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import './style.less'
import { ButtonProps } from 'antd/lib/button'

const TIME = 60
export interface SendCodeProps extends ButtonProps {
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

export const SendCodeBtn: FC<SendCodeProps> = ({
  beforeSend,
  btnRef,
  ...buttonProps
}) => {
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

    let beforeStop = !(await beforeSend())
    console.log('beforeStop', beforeStop)
    if (beforeStop) {
      setLoading(false)
      return
    }
    setLoading(false)
    send()
  }

  return (
    <Button
      {...buttonProps}
      className={
        buttonProps.type ?? 'authing-g2-send-code-btn g2-loading-btn-center'
      }
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      ref={btnRef}
    >
      {loading === true && <span></span>}
      {loading === false && (
        <span>
          {enabled
            ? t('common.sendVerifyCode')
            : t('common.retryAfterTime', {
                time: countDown,
              })}
        </span>
      )}
    </Button>
  )
}
