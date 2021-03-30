import { message } from 'antd'
import { User } from 'authing-js-sdk'
import React, { FC } from 'react'

import { useGuardContext } from '../../../context/global/context'
import {
  GuardScenes,
  LoginMethods,
  RegisterMethods,
} from '../../../components/AuthingGuard/types'
import { AuthingTabs } from '../../../common/AuthingTabs'
import { REGISTER_METHODS_MAP } from '../../../components/AuthingGuard/constants'
import {
  EmailRegisterForm,
  PhoneRegisterForm,
} from '../../../components/AuthingGuard/Forms'
import { useTranslation } from 'react-i18next'

export const RegisterLayout: FC = () => {
  const {
    state: {
      config: { registerMethods, extendsFields },
      activeTabs,
      guardEvents,
      authClient,
    },
    setValue,
  } = useGuardContext()

  const { t } = useTranslation()
  const onSuccess = (user: User) => {
    message.success(t('common.registrationSuccess'))
    if (extendsFields?.length > 0) {
      setValue('guardScenes', GuardScenes.CompleteUserInfo)
    } else {
      setValue('guardScenes', GuardScenes.Login)
    }
    guardEvents.onRegister?.(user, authClient)
  }

  const onFail = (error: any) => {
    guardEvents.onRegisterError?.(error, authClient)
  }

  const formProps = {
    onSuccess,
    onFail,
  }

  const onTabClick = (t: string) => {
    const next = {
      ...activeTabs,
      [GuardScenes.Register]: t,
    }
    switch (t) {
      case RegisterMethods.Email:
        next[GuardScenes.Login] = LoginMethods.Password
        break
      case RegisterMethods.Phone:
        next[GuardScenes.Login] = LoginMethods.PhoneCode
        break
      default:
        break
    }

    setValue('activeTabs', next)
  }

  const REGISTER_FORM_MAP = {
    [RegisterMethods.Email]: <EmailRegisterForm {...formProps} />,
    [RegisterMethods.Phone]: <PhoneRegisterForm {...formProps} />,
  }

  const tabs = registerMethods!.map((item) => ({
    key: item,
    label: REGISTER_METHODS_MAP[item],
    component: REGISTER_FORM_MAP[item],
  }))

  return (
    <AuthingTabs
      activeKey={activeTabs[GuardScenes.Register]}
      onTabClick={onTabClick}
      tabs={tabs}
    ></AuthingTabs>
  )
}
