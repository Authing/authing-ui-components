import React from 'react'
import { Button } from 'antd'

import { useGuardContext } from '../../../../context/global/context'
import { GuardScenes } from '../../../../components/AuthingGuard/types'

export const ResetPwdFormFooter = () => {
  const { setValue } = useGuardContext()

  return (
    <Button
      onClick={() => setValue('guardScenes', GuardScenes.Login)}
      className="authing-guard-text-btn authing-guard-form-actions"
      type="text"
      htmlType="button"
    >
      其他账号登录
    </Button>
  )
}
