import React, { FC } from 'react'
import { Avatar } from 'antd'

import { useGuardContext } from '@/context/global/context'

import './style.less'

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GuardHeader: FC<HeaderProps> = (props) => {
  const {
    state: {
      config: { logo, title },
    },
  } = useGuardContext()

  return (
    <div className="authing-guard-header">
      <Avatar className="authing-guard-logo" src={logo} size={50}></Avatar>
      <div className="authing-guard-title">{title}</div>
    </div>
  )
}
