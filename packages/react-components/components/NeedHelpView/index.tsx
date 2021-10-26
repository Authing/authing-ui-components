import React, { useEffect, useState } from 'react'
import { message } from 'antd'
import { ImagePro } from '../ImagePro'
import { DescribeQuestions } from './core/describeQuestions'
import { GuardModuleType } from '../Guard/module'

export const GuardNeedHelpView = (props: any) => {
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
        <DescribeQuestions />
      </div>
      <div className="g2-tips-line ">
        <div className="back-to-login">
          没有问题，
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
