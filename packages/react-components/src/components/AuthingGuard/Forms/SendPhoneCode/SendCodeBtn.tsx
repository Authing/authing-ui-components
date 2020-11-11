import React, { FC, useState, useRef, useEffect, useMemo } from 'react'

const TIME = 60
export interface SendCodeProps {
  beforeSend: () => Promise<boolean>
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

export const SendCodeBtn: FC<SendCodeProps> = ({ beforeSend }) => {
  const { enabled, send, countDown } = useSentCounter()

  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!enabled) {
      return
    }

    if (!(await beforeSend())) return
    send()
  }

  return (
    <button
      type="button"
      className="authing-send-code-btn"
      disabled={!enabled}
      onClick={onClick}
    >
      {enabled ? '发送验证码' : `${countDown} 秒后重试`}
    </button>
  )
}
