import React from 'react'
import { useTranslation } from 'react-i18next'
import { message } from 'antd'
import { ImagePro } from '../ImagePro'
import { DescribeQuestions } from './core/describeQuestions'
import { GuardModuleType } from '../Guard/module'

export const GuardNeedHelpView = (props: any) => {
  // console.log('props.config', props)
  const { t } = useTranslation()

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
          onSuccess={() => {
            let text = `${t('common.problem.successTip')}，${t(
              'common.problem.successTipMsg'
            )}`
            message.success(text)
            setTimeout(() => {
              props.__changeModule(GuardModuleType.LOGIN)
            }, 500)
          }}
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
