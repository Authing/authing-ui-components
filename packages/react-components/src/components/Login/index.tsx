import React from 'react'
import { GuardLoginProps } from './props'

export const GuardLogin: React.FC<GuardLoginProps> = (props) => {
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
