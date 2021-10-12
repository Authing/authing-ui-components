import React from 'react'
import { useConfig } from '../Guard/config'

export const GuardLogin = () => {
  console.log('login 组件开始加载')
  const config = useConfig()

  return <span>{JSON.stringify(config)}</span>
}
