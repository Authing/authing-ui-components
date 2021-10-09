import React, { ReactNode, useState } from 'react'
import { GuardLogin } from '../Login'

export const GuardApp = () => {
  const mapping: Record<'login', ReactNode> = {
    login: <GuardLogin />,
  }

  const [path, setPath] = useState<'login'>('login')

  return <>{mapping[path]}</>
}
