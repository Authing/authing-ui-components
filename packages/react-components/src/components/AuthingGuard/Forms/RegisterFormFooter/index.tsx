import { Button } from 'antd'
import React, { FC } from 'react'
import { useGuardContext } from '../../../../context/global/context'
import { GuardScenes } from '../../../../components/AuthingGuard/types'

import './style.less'

export interface RegisterFormFooterProps {
  loading: boolean
}

export const RegisterFormFooter: FC<RegisterFormFooterProps> = ({
  loading,
}) => {
  const {
    setValue,
    state: { config },
  } = useGuardContext()

  return (
    <>
      <Button
        htmlType="submit"
        size="large"
        type="primary"
        loading={loading}
        block
      >
        {loading
          ? config.text?.registerBtn?.loading
          : config.text?.registerBtn?.normal}
      </Button>

      <div className="authing-guard-form-actions">
        <div className="authing-guard-tip-btn-comb">
          <span className="authing-guard-tip">已有账号，</span>
          <Button
            onClick={() => setValue('guardScenes', GuardScenes.Login)}
            className="authing-guard-text-btn"
            type="text"
          >
            立即登录
          </Button>
        </div>
      </div>
    </>
  )
}
