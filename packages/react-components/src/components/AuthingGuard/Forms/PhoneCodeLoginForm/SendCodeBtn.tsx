import React, { FC, useState, useRef, useEffect, useMemo } from 'react'

export interface SendCodeProps {
  beforeSend: () => Promise<boolean>
}

const useSentCounter = () => {
  const [countDown, setCountDown] = useState(0)
  const timerRef = useRef<any>(0)

  useEffect(() => {
    clearInterval(timerRef.current)
  }, [])

  const enabled = useMemo(() => countDown <= 0, [countDown])

  const send = () => {
    setCountDown(60)
    timerRef.current = setInterval(() => {
      setCountDown(countDown - 1)

      if (countDown <= 0) {
        clearInterval(timerRef.current)
      }
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
