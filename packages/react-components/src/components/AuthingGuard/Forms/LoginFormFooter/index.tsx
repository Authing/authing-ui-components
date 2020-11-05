import { Button } from 'antd'
import React, { FC } from 'react'
import { useGuardContext } from '@/context/global/context'
import { GuardState } from '@/components/AuthingGuard/types'

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
  const { setValue } = useGuardContext()

  return (
    <>
      <Button
        htmlType="submit"
        size="large"
        type="primary"
        loading={loading}
        block
      >
        登录
      </Button>

      <div className="authing-guard-form-actions">
        {needRestPwd && (
          <Button
            onClick={() => setValue('guardState', GuardState.RestPassword)}
            className="authing-guard-text-btn"
            type="text"
          >
            忘记密码？
          </Button>
        )}
        {needRegister && (
          <div className="authing-guard-tip-btn-comb">
            <span className="authing-guard-tip">还没有账号，</span>
            <Button
              onClick={() => setValue('guardState', GuardState.Register)}
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
