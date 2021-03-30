import { Button } from 'antd'
import React, { FC } from 'react'
import { useGuardContext } from '../../../../context/global/context'
import { GuardScenes } from '../../../../components/AuthingGuard/types'

import './style.less'

export interface LoginFormFooterProps {
  loading: boolean
  needRestPwd?: boolean
  needRegister?: boolean
}

export const LoginFormFooter: FC<LoginFormFooterProps> = ({
  loading,
  needRestPwd = false,
  needRegister = false,
}) => {
  const {
    setValue,
    state: { config },
  } = useGuardContext()

  return (
    <>
      <Button
        htmlType="submit"
        className="authing-guard-form-submit-btn"
        size="large"
        type="primary"
        loading={loading}
        block
      >
        {loading
          ? config.text?.loginBtn?.loading
          : config.text?.loginBtn?.normal}
      </Button>

      <div className="authing-guard-form-actions">
        {needRestPwd && !config.disableResetPwd && (
          <Button
            onClick={() => setValue('guardScenes', GuardScenes.RestPassword)}
            className="authing-guard-text-btn"
            type="text"
          >
            忘记密码？
          </Button>
        )}
        {needRegister && !config.disableRegister && (
          <div className="authing-guard-tip-btn-comb">
            <span className="authing-guard-tip">还没有账号，</span>
            <Button
              onClick={() => setValue('guardScenes', GuardScenes.Register)}
              className="authing-guard-text-btn"
              type="text"
            >
              立即注册
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
