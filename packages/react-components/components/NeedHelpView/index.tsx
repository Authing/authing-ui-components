import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePro } from '../ImagePro'
import { DescribeQuestions } from './core/describeQuestions'
import { GuardModuleType } from '../Guard/module'
import SubmitButton from '../SubmitButton'

export const GuardNeedHelpView = (props: any) => {
  const [mode, setMode] = useState<'typing' | 'success'>('typing')
  const { t } = useTranslation()
  const cdnBase = props.config.__publicConfig__?.cdnBase
  const timerRef = useRef<any>(0)
  const [countDown, setCountDown] = useState(5)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (countDown <= 0) {
      clearInterval(timerRef.current)
      props.__changeModule(GuardModuleType.LOGIN)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countDown])

  const onSuccess = () => {
    setMode('success')
    setCountDown(5)
    timerRef.current = setInterval(() => {
      setCountDown((prev) => {
        return prev - 1
      })
    }, 1000)
  }

  if (mode === 'typing') {
    return (
      <div className="g2-view-container">
        <div className="g2-view-header">
          <ImagePro
            src={props.config?.logo}
            size={48}
            borderRadius={4}
            alt=""
            className="icon"
          />

          <div className="title">问题反馈</div>
        </div>
        <div className="g2-view-tabs">
          <DescribeQuestions
            appId={props.config.__publicConfig__.id}
            host={props.config.__appHost__}
            onSuccess={onSuccess}
          />
        </div>
        <div className="g2-tips-line ">
          <div className="back-to-login">
            <span className="gray">没有问题，</span>
            <span
              className="link-like"
              onClick={() => props.__changeModule(GuardModuleType.LOGIN)}
            >
              直接登录
            </span>
          </div>
        </div>
      </div>
    )
  }

  // mode === 'success' 的情况

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
        <div className="title">{t('common.problem.successTip')}</div>
        <div className="message">{t('common.problem.successTipMsg')}</div>
        <SubmitButton
          onClick={() => {
            props.__changeModule(GuardModuleType.LOGIN)
          }}
          text={t('common.backLoginPage')}
        />
        <div className="timer-tip">{countDown} 后将自动跳转登录页</div>
      </div>
    </div>
  )
}
