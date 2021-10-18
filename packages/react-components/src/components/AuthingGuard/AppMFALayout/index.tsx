import { message } from 'antd'
import { User } from 'authing-js-sdk'
import React, { FC, ReactNode, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthingDropdown } from 'src/common/AuthingDropdown'

import {
  EmailMfaVerifyForm,
  SmsMfaVerifyForm,
} from '../../../components/AuthingGuard/Forms'
import { useGuardContext } from '../../../context/global/context'
import { ApplicationMfaType, ApplicationMfaTypeLabel } from '../api'
import { TotpMfaVerifyForm } from '../Forms/TotpMfaVerifyForm'

import './style.less'

export interface MfaLayoutProps {}

export const AppMfaLayout: FC<MfaLayoutProps> = () => {
  const { t } = useTranslation()
  const {
    state: { guardEvents, authClient, mfaData },
  } = useGuardContext()

  const [type, setType] = useState(ApplicationMfaType.SMS)

  const onSuccess = (user: User) => {
    message.success(t('common.LoginSuccess'))
    guardEvents.onLogin?.(user, authClient)
  }

  const onFail = (error: any) => {
    guardEvents.onLoginError?.(error, authClient)
  }

  const formProps = {
    onSuccess,
    onFail,
  }

  const formMap: Record<ApplicationMfaType, ReactNode> = {
    [ApplicationMfaType.EMAIL]: <EmailMfaVerifyForm {...formProps} />,
    [ApplicationMfaType.SMS]: <SmsMfaVerifyForm {...formProps} />,
    [ApplicationMfaType.OTP]: <TotpMfaVerifyForm {...formProps} />,
  }

  // 其他可选的模块
  const availableMfaType = useMemo(() => {
    return mfaData.applicationMfa
      ?.filter(
        (item) =>
          item.status &&
          Object.keys(ApplicationMfaType).includes(item.mfaPolicy) &&
          type !== item.mfaPolicy
      )
      ?.sort((a, b) => a.sort - b.sort)
      ?.map((item) => ({
        label: ApplicationMfaTypeLabel()[item.mfaPolicy],
        key: item.mfaPolicy,
        onClick() {
          setType(item.mfaPolicy)
        },
      }))
  }, [mfaData, type])

  // 根据配置动态确定 mfa 模块
  useEffect(() => {
    // 取出第一个模块 作为默认值
    if (mfaData.applicationMfa && mfaData.applicationMfa.length > 0) {
      setType(mfaData.applicationMfa[0].mfaPolicy)
    }
  }, [mfaData])

  return (
    <div className="authing-text-center">
      {formMap[type]}
      {(availableMfaType?.length || 0 > 1) && (
        <AuthingDropdown
          className="toggle-mfa-dropdown"
          menus={availableMfaType!}
        >
          <span className="authing-toggle-mfa">
            {t('login.otherVerifyWay')}
          </span>
        </AuthingDropdown>
      )}
    </div>
  )
}
