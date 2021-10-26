import React from 'react'
import { Button } from 'antd'

import { useGuardContext } from '../../../context/global/context'
import { GuardScenes } from '../../../../components/AuthingGuard/types'
import { useTranslation } from 'react-i18next'

export const ResetPwdFormFooter = () => {
  const { setValue } = useGuardContext()
  const { t } = useTranslation()
  return (
    <Button
      onClick={() => setValue('guardScenes', GuardScenes.Login)}
      className="authing-guard-text-btn authing-guard-form-actions"
      type="text"
      htmlType="button"
    >
      {t('login.otherAccLogin')}
    </Button>
  )
}
