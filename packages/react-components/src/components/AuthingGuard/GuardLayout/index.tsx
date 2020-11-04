import React, { useRef } from 'react'
import { User } from 'authing-js-sdk'

import './style.css'

import { PasswordLoginForm } from '@/components/AuthingGuard/Forms/PasswordLoginForm'
import { Button } from 'antd'
import { FormInstance } from 'antd/lib/form'

export const GuardLayout = () => {
    const formRef = useRef<FormInstance>(null)

  const onSuccess = (user: User) => {
    console.log('登录成功', user)
  }

  const handleLogin = () => {
    formRef.current!.submit()
  }

  return (
    <div className="authing-guard-layout">
      <div className="authing-guard-container">
        <PasswordLoginForm ref={formRef} onSuccess={onSuccess} />

        <Button type="primary" onClick={handleLogin} block>登录</Button>
      </div>
    </div>
  )
}
