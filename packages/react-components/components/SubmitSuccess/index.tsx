import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GuardModuleType } from '..'
import { ImagePro } from '../ImagePro'
import SubmitButton from '../SubmitButton'
import { GuardSubmitSuccessViewProps } from './interface'

export const GuardSubmitSuccessView: React.FC<GuardSubmitSuccessViewProps> = (
  props
) => {
  const { t } = useTranslation()
  const { initData, config } = props
  const [countDown, setCountDown] = useState(5)

  const timerRef = useRef<any>(0)

  const {
    title = t('common.problem.successTip'),
    message = t('common.problem.successTipMsg'),
  } = initData ?? {}

  const cdnBase = config?.__publicConfig__?.cdnBase

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
      props.__changeModule?.(GuardModuleType.ANY_QUESTIONS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countDown])

  return (
    <div className="g2-view-container">
      <div className="g2-view-tabs g2-questions-send-success-page">
        <ImagePro
          className="plate"
          src={`${cdnBase}/questions-send-ok.png`}
          alt=""
          width={191}
          height={146}
        />
        <div className="title">{title}</div>
        <div className="message">{message}</div>
        <SubmitButton
          onClick={() => {
            props.__changeModule?.(GuardModuleType.ANY_QUESTIONS)
          }}
          text={t('common.backFeedback')}
        />
        <div className="timer-tip">
          {countDown} {t('common.laterBackFeedbck')}
        </div>
      </div>
    </div>
  )
}
