import { Button } from 'antd'
import React, { FC, useMemo } from 'react'
import { EllipsisOutlined } from '@ant-design/icons'

import { getClassnames } from '../../utils'

import './style.less'

export interface AuthingTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeKey?: string
  onTabClick: (key: string) => void
  showLen?: number
  tabs: {
    key: string
    label: string
    component: JSX.Element
  }[]
}

export const AuthingTabs: FC<AuthingTabsProps> = ({
  tabs,
  showLen = 3,
  className,
  activeKey,
  onTabClick,
}) => {
  const activeIndex = useMemo(
    () => tabs.findIndex((item) => item.key === activeKey),
    [tabs, activeKey]
  )

  const showTabs = useMemo(() => {
    if (tabs.length <= showLen) {
      return [...tabs]
    }

    let startIndex = Math.max(activeIndex - 1, 0)
    if (startIndex + showLen > tabs.length - 1) {
      startIndex = tabs.length - showLen
    }

    return tabs.slice(startIndex, startIndex + showLen)
  }, [showLen, activeIndex, tabs])

  const hideTabs = useMemo(() => {
    const showKeys = showTabs.map((item) => item.key)
    return tabs.filter((item) => !showKeys.find((key) => item.key === key))
  }, [tabs, showTabs])

  return (
    <>
      <div className={getClassnames(['authing-tabs', className])}>
        <div
          className={getClassnames([
            'authing-tabs-inner',
            Boolean(hideTabs.length) && 'authing-tabs-inner--more',
          ])}
        >
          {showTabs.map((item, index) => (
            <div
              onClick={() => onTabClick(item.key)}
              className={getClassnames([
                'authing-tab-item',
                activeKey === item.key && 'authing-tab-item__active',
              ])}
              key={item.key}
            >
              {item.label}
            </div>
          ))}
        </div>
        {Boolean(hideTabs.length) && (
          <Button
            className="authing-tabs-show-more"
            type="text"
            icon={<EllipsisOutlined />}
          >
            <ul className="authing-tabs-more-panel">
              {hideTabs.map((item) => (
                <li
                  key={item.key}
                  onClick={() => onTabClick(item.key)}
                  className="authing-tabs-more-panel-item"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </Button>
        )}
      </div>

      <div className="authing-tab-pane">
        {tabs.find((item) => item.key === activeKey)?.component}
      </div>
    </>
  )
}
