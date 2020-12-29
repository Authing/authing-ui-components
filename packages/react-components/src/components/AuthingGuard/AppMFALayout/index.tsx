import { message } from 'antd'
import { User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'
import { AuthingDropdown } from 'src/common/AuthingDropdown'

import {
  EmailMfaVerifyForm,
  SmsMfaVerifyForm,
} from '../../../components/AuthingGuard/Forms'
import { useGuardContext } from '../../../context/global/context'
import { ApplicationMfaType, ApplicationMfaTypeLabel } from '../api'

import './style.less'

export interface MfaLayoutProps {}

export const AppMfaLayout: FC<MfaLayoutProps> = () => {
  const {
    state: { guardEvents, authClient, mfaData },
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

  const availableMfaType = mfaData.applicationMfa
    ?.filter((item) => item.status)
    ?.sort((a, b) => a.sort - b.sort)
    ?.map((item) => ({
      label: ApplicationMfaTypeLabel[item.mfaPolicy],
      key: item.mfaPolicy,
      onClick() {
        setType(item.mfaPolicy)
      },
    }))

  return (
    <div className="authing-text-center">
      {formMap[type]}
      {(availableMfaType?.length || 0 > 1) && (
        <AuthingDropdown
          className="toggle-mfa-dropdown"
          menus={availableMfaType!}
        >
          <span className="authing-toggle-mfa">其他验证方式</span>
        </AuthingDropdown>
      )}
    </div>
  )
}
