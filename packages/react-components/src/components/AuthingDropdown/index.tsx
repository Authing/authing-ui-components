import { DownOutlined } from '@ant-design/icons'
import React, { FC, useState } from 'react'
import { getClassnames } from '../_utils'

import './style.less'

/**
 * 不使用 antd 的 dropdown，因为里面会用 tooltip，体积过大
 */
export const AuthingDropdown: FC<{
  className?: string
  menus: {
    label: React.ReactNode
    key: string | number
    onClick?: (
      key: string | number,
      evt: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => void
  }[]
}> = ({ menus, children, className }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={getClassnames(['authing-dropdown', className])}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div className="authing-dropdown-trigger">{children}</div>
      <div
        className={getClassnames([
          'authing-dropdown-menu-container',
          visible && 'authing-dropdown-menu-container__visible',
        ])}
      >
        {menus.map((item) => (
          <div
            className="authing-dropdown-menu-item"
            onClick={(evt) => {
              setVisible(false)
              item.onClick?.(item.key, evt)
            }}
            key={item.key}
          >
            {item.label}
          </div>
        ))}
      </div>
      <DownOutlined className="authing-dropdown-icon" />
    </div>
  )
}
