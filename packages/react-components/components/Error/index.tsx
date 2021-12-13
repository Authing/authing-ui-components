import React from 'react'
import { ImagePro } from '../ImagePro'
import { GuardErrorViewProps } from './interface'
import { i18n } from '../_utils/locales'

import './styles.less'

export const GuardErrorView: React.FC<GuardErrorViewProps> = (props) => {
  const messages = props?.initData?.messages
    ? `${i18n.t('user.error')}：${props?.initData?.messages} `
    : `${i18n.t('user.contactAdministrator')}`
  const imgSrc = require('../assets/images/error.png').default

  return (
    <div className="g2-view-container">
      <div className="g2-error-content">
        <ImagePro width={240} height={162} src={imgSrc} alt="guard error img" />
        <span>{messages}</span>
      </div>
    </div>
  )
}
