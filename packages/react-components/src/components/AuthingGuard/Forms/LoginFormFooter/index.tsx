import { Button } from 'antd'
import React, { FC } from 'react'

import './style.less'

export interface LoginFormFooterProps {
  loading: boolean
  onLogin: (evt: React.MouseEvent) => void
}

export const LoginFormFooter: FC<LoginFormFooterProps> = ({
  loading,
  onLogin,
}) => {
  return (
    <>
      <Button
        htmlType="submit"
        size="large"
        type="primary"
        loading={loading}
        onClick={onLogin}
        block
      >
        登录
      </Button>

      <div className="authing-guard-login-actions">
        <Button className="authing-guard-text-btn" type="text">忘记密码？</Button>
        <div className="authing-guard-go-register">
          <span className="authing-guard-go-register-tip">还没有账号，</span>
          <Button className="authing-guard-text-btn" type="text">立即注册</Button>
        </div>
      </div>
    </>
  )
}
