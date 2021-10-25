import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { message, Tabs } from 'antd'
import { intersection } from 'lodash'

import { useAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { LoginMethods } from '../AuthingGuard/types'
import { IconFont } from '../IconFont'
import { ResetPassword } from './core/resetPassword'

import './styles.less'
import { ImagePro } from 'src/common/ImagePro'

export const GuardForgetPassword = (props: any) => {
  const client = useAuthClient()

  let publicKey = props.config?.publicKey!
  let ms = props.config?.loginMethods
  let { autoRegister } = props.config

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
        <ResetPassword />
      </div>
    </div>
  )
}
