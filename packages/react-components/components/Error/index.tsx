import React from 'react'
import { GuardErrorViewProps } from './interface'
import { i18n } from '../_utils/locales'
import { ReactComponent as ErrorLogo } from '../assets/svg/img_error.svg'
import './styles.less'

export const GuardErrorView: React.FC<GuardErrorViewProps> = (props) => {
  const messages = props?.initData?.messages
    ? `${i18n.t('user.error')}：${props?.initData?.messages} `
    : `${i18n.t('user.contactAdministrator')}`

  return (
    <div className="g2-view-container">
      <div className="g2-error-content">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ErrorLogo style={{ width: 240, height: 160 }} />
        </div>
        <span>{messages}</span>
      </div>
    </div>
  )
}
