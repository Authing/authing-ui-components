import React, { FC } from 'react'
import { CompleteUserInfoForm } from '../Forms/CompleteUserInfoForm'

import './style.less'

export const CompleteUserInfoLayout: FC = () => {
  return (
    <div>
      <h2 className="authing-guard-complete-info-title">完善用户信息</h2>

      <p className="authing-guard-complete-info-msg">
        欢迎加入 示例应用 ，为了更好的使用体验，请先完善您的资料信息
      </p>

      <CompleteUserInfoForm />
    </div>
  )
}
