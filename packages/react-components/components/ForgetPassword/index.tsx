import React from 'react'
import { useTranslation } from 'react-i18next'
import { message } from 'antd'

import { GuardModuleType } from '../Guard/module'
import { ResetPassword } from './core/resetPassword'

import { ImagePro } from '../ImagePro'

export const GuardForgetPassword = (props: any) => {
  const { t } = useTranslation()
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
        <div className="title">{t('login.resetPwd')}</div>
        <div className="title-explain">{t('user.resetpasswordText1')}</div>
      </div>
      <div className="g2-view-tabs">
        <ResetPassword onReset={onReset} publicConfig={publicConfig} />
      </div>
      <div className="g2-tips-line">
        <div
          className="link-like back-to-login"
          onClick={() => props.__changeModule(GuardModuleType.LOGIN)}
        >
          {t('login.otherAccLogin')}
        </div>
      </div>
    </div>
  )
}
