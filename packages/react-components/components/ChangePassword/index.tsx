import React, { useEffect, useState } from 'react'
import { message } from 'antd'

import { GuardModuleType } from '../Guard/module'
import { FirstLoginReset } from './core/firstLoginReset'

import { ImagePro } from '../ImagePro'

// 手动修改密码，并非「忘记密码」
// 进入的场景是读取配置：1开了首次登录修改密码 || 2开了密码轮换
export const GuardChangePassword = (props: any) => {
  let publicConfig = props.config.__publicConfig__

  // const onReset = (res: any) => {
  //   let code = res.code
  //   if ([2001, 2004].includes(code)) {
  //     message.error(res.message)
  //     return
  //   }
  //   // 返回登录
  //   props.__changeModule(GuardModuleType.LOGIN)
  // }

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
        <div className="title">欢迎访问 xxxxxx</div>
        <div className="title-explain">
          为了保障账号安全，请设置你的初始密码。
        </div>
      </div>
      <div className="g2-view-tabs">
        {/* <ResetPassword onReset={onReset} publicConfig={publicConfig} /> */}
      </div>
    </div>
  )
}
