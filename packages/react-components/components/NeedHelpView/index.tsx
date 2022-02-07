import React from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePro } from '../ImagePro'
import { DescribeQuestions } from './core/describeQuestions'
import { GuardModuleType } from '../Guard/module'

export const GuardNeedHelpView = (props: any) => {
  const { t } = useTranslation()

  const onSuccess = () => {
    props.__changeModule?.(GuardModuleType.SUBMIT_SUCCESS)
  }

  return (
    <div className="g2-view-container g2-need-help">
      <div className="g2-view-header">
        <ImagePro
          src={props.config?.logo}
          size={48}
          borderRadius={4}
          alt=""
          className="icon"
        />

        <div className="title">{t('common.problem.title')}</div>
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
          <span className="gray">{t('common.noQuestions')}</span>
          <span
            className="link-like"
            onClick={() => props.__changeModule(GuardModuleType.LOGIN)}
          >
            {t('common.goToLogin')}
          </span>
        </div>
      </div>
    </div>
  )
}
