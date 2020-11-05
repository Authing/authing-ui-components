import { Tabs } from 'antd'
import React, { FC } from 'react'
import { TabsProps } from 'antd/lib/tabs'

import "./style.less"

export const AuthingTabs: FC<TabsProps> = ({ children, ...tabProps }) => {
  return (
    <Tabs size="large" {...tabProps} centered className="authing-guard-tabs">
      {children}
    </Tabs>
  )
}
