import { DownOutlined } from '@ant-design/icons'
import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getClassnames } from '../../utils'

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

  const triggerRef = useRef<HTMLDivElement>(null)

  const [top, setTop] = useState<number>()
  const [left, setLeft] = useState<number>()

  useEffect(() => {
    const global = require('globalthis')()

    const changePosition = () => {
      const value = triggerRef.current?.getBoundingClientRect()
      value && setTop(value?.top + value?.height)
      value && setLeft(value?.left)
    }

    changePosition()
    global?.window.addEventListener('scroll', changePosition)
    global?.window.addEventListener('DOMNodeInserted', changePosition)
    global?.window.addEventListener('DOMNodeRemoved', changePosition)
    global.window.onresize = changePosition
    return () => {
      global?.window.removeEventListener('scroll', changePosition)
      global?.window.removeEventListener('DOMNodeInserted', changePosition)
      global?.window.removeEventListener('DOMNodeRemoved', changePosition)
    }
  }, [])

  return (
    // TODO
    // 没有下拉 与回收的动效，暂时没有时间搞，之后优化
    <div
      className={getClassnames(['authing-dropdown', className])}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div ref={triggerRef} className="authing-dropdown-trigger">
        {children}
      </div>
      {visible
        ? createPortal(
            <div
              data-id="authing-dropdown-menu"
              className={getClassnames(['authing-dropdown-menu-container'])}
              style={{
                top: top,
                left: left,
              }}
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
            </div>,
            document.body
          )
        : null}
      <DownOutlined className="authing-dropdown-icon" />
    </div>
  )
}
