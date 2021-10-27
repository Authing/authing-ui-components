import React from 'react'
import { message } from 'antd'

import { GuardModuleType } from '../Guard/module'
import { ResetPassword } from './core/resetPassword'

import { ImagePro } from '../ImagePro'

export const GuardForgetPassword = (props: any) => {
  let publicConfig = props.config.__publicConfig__

  const onReset = (res: any) => {
    let code = res.code
    if ([2001, 2004].includes(code)) {
      message.error(res.message)
      return
    }
    // 返回登录
    props.__changeModule(GuardModuleType.LOGIN)
  }

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
        {/* <img src={props.config?.logo} alt="" className="icon" /> */}
        <div className="title">重置密码</div>
        <div className="title-explain">
          输入你的注册电话 /
          邮箱，将发送密码重置码给你，该账号关联的所有密码将被重置。
        </div>
      </div>
      <div className="g2-view-tabs">
        <ResetPassword onReset={onReset} publicConfig={publicConfig} />
      </div>
      <div className="g2-tips-line">
        <div
          className="link-like back-to-login"
          onClick={() => props.__changeModule(GuardModuleType.LOGIN)}
        >
          其他账号登录
        </div>
      </div>
    </div>
  )
}
