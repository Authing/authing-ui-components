import React from 'react'
import { IG2FCProps } from 'src/classes/IGuardV2FCProps'

interface LoginConfig {
  autoRegister: boolean
}

interface LoginEvents {
  onLogin: () => void
}

interface GuardLoginProps extends IG2FCProps, LoginEvents {
  config?: LoginConfig
}

export const GuardLogin = (props: any) => {
  // props: appId, initData, config
  console.log('login 组件开始加载', props)
  const onLogin = () => {
    // 接口得到 code
    // if (code === 1) {
    //   props.onLogin('登录成功')
    // }
  }
  return (
    <div>
      <input type="text" />
      <input type="text" />
      <button>保存</button>
    </div>
  )
}
