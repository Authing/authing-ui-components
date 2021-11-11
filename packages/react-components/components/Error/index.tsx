import React from 'react'
import { ImagePro } from '../ImagePro'
import { GuardErrorViewProps } from './interface'

import './styles.less'

export const GuardErrorView: React.FC<GuardErrorViewProps> = (props) => {
  const messages = props?.initData?.messages
    ? `出错了～：${props?.initData?.messages} `
    : `未知的错误～ 请您联系管理员进行处理`
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
