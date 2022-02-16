import { Button } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { GuardModuleType } from '..'
import { IconFont } from '../IconFont'
import { GuardIdentityBindingViewProps } from './interface'
import './styles.less'

export const GuardIdentityBindingView: React.FC<GuardIdentityBindingViewProps> = (
  props
) => {
  const { __changeModule, config } = props
  const { t } = useTranslation()

  const onBack = () => {}

  return (
    <div className="g2-view-container g2-view-identity-binding">
      <div className="g2-view-back" style={{ display: 'inherit' }}>
        <span onClick={onBack} className="g2-view-mfa-back-hover">
          <IconFont type="authing-arrow-left-s-line" style={{ fontSize: 24 }} />
          <span>{t('common.back')}</span>
        </span>
      </div>

      <div className="g2-view-identity-binding-content">
        <div className="g2-view-identity-binding-content-logo">
          <img src={props.config?.logo} alt="" className="logo" />
        </div>
        <div className="g2-view-identity-binding-content-title">
          <span>{t('common.identityBindingTitle')}</span>
        </div>
        <div className="g2-view-identity-binding-content-desc">
          <span>{t('common.identityBindingDesc')}</span>
        </div>
        <div className="g2-view-identity-binding-content-login"></div>
      </div>
    </div>
  )
}
