import React, { FC } from 'react'
import { Avatar } from 'antd'

import { useGuardContext } from '../../../context/global/context'
import { GuardScenes } from '../../../components/AuthingGuard/types'
import { useTranslation } from 'react-i18next'
import './style.less'

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  guardScenes: GuardScenes
}

export const GuardHeader: FC<HeaderProps> = (props) => {
  const { guardScenes } = props
  const {
    state: {
      config: { logo, title },
      restPassword,
    },
  } = useGuardContext()
  const { t } = useTranslation()

  return (
    <div className="authing-guard-header">
      {Boolean(logo) && (
        <Avatar className="authing-guard-logo" src={logo} size={50}></Avatar>
      )}
      <div className="authing-guard-title">
        {guardScenes === 'restPassword'
          ? restPassword === 1
            ? t('common.retrievePassword')
            : t('common.resetPwd')
          : title}
      </div>
    </div>
  )
}
