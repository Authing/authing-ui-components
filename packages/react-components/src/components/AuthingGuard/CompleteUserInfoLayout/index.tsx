import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useGuardContext } from '../../context/global/context'
import { CompleteUserInfoForm } from '../Forms/CompleteUserInfoForm'

import './style.less'

export const CompleteUserInfoLayout: FC = () => {
  const {
    state: { guardTitle },
  } = useGuardContext()

  const { t } = useTranslation()
  return (
    <div>
      <h2 className="authing-guard-complete-info-title">
        {t('common.perfectUserInfo')}
      </h2>

      <p className="authing-guard-complete-info-msg">
        {t('common.welcomeDoc', {
          name: guardTitle,
        })}
      </p>

      <CompleteUserInfoForm />
    </div>
  )
}
