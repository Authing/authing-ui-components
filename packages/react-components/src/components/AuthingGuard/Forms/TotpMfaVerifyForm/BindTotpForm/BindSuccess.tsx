import React, { FC, useEffect } from 'react'
import { Space } from 'antd'
import { TotpSource } from '../UserMfa'
import { User } from 'authing-js-sdk'
import { useTranslation } from 'react-i18next'
import { useGuardContext } from '../../../../../context/global/context'

export const BindSuccess: FC<{
  totpSource?: TotpSource
  user?: User
}> = ({ totpSource = TotpSource.SELF, user }) => {
  const { t } = useTranslation()

  const {
    state: { guardEvents, authClient },
  } = useGuardContext()

  useEffect(() => {
    if (user && totpSource === TotpSource.APPLICATION) {
      setTimeout(() => {
        guardEvents.onLogin?.(user as any, authClient)
      }, 1000)
    }
  }, [])

  return (
    <Space size={16} direction="vertical">
      <img
        width="148"
        height="148"
        style={{
          marginBottom: '34px',
        }}
        src={
          'https://files.authing.co/authing-user-portal/mfa-bind-success.png'
        }
        alt="bind success"
      />
      <h4 className={'subtitle'}>{t('user.bindSuccess')}</h4>
      {/* {totpSource === TotpSource.APPLICATION ? (
        <p className={'desc'}>{t('common.bindAppTotp')}</p>
      ) : (
        <p className={'desc'}>{t('user.bindedMfa')}</p>
		  )} */}
      <p className={'desc'}>{t('user.bindedMfa')}</p>
    </Space>
  )
}
