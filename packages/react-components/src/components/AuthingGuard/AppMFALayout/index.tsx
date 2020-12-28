import { message } from 'antd'
import { User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'
import { AuthingDropdown } from 'src/common/AuthingDropdown'

import {
  EmailMfaVerifyForm,
  SmsMfaVerifyForm,
} from '../../../components/AuthingGuard/Forms'
import { useGuardContext } from '../../../context/global/context'
import { ApplicationMfaType } from '../api'

import './style.less'

export interface MfaLayoutProps {}

export const AppMfaLayout: FC<MfaLayoutProps> = () => {
  const {
    state: { guardEvents, authClient },
  } = useGuardContext()

  const [type, setType] = useState(ApplicationMfaType.SMS)

  const onSuccess = (user: User) => {
    message.success('登录成功')
    guardEvents.onLogin?.(user, authClient)
  }

  const onFail = (error: any) => {
    guardEvents.onLoginError?.(error, authClient)
  }

  const formProps = {
    onSuccess,
    onFail,
  }

  const formMap = {
    [ApplicationMfaType.EMAIL]: <EmailMfaVerifyForm {...formProps} />,
    [ApplicationMfaType.SMS]: <SmsMfaVerifyForm {...formProps} />,
  }

  return (
    <div className="authing-text-center">
      {formMap[type]}
      <AuthingDropdown
        className="toggle-mfa-dropdown"
        menus={[
          {
            label: '短信验证码验证',
            key: ApplicationMfaType.SMS,
            onClick() {
              setType(ApplicationMfaType.SMS)
            },
          },
          {
            label: '电子邮箱验证',
            key: ApplicationMfaType.EMAIL,
            onClick() {
              setType(ApplicationMfaType.EMAIL)
            },
          },
        ]}
      >
        <span className="authing-toggle-mfa">其他验证方式</span>
      </AuthingDropdown>
    </div>
  )
}
