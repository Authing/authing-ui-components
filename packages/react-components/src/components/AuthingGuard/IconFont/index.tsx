import React, { FC } from 'react'
import './iconfont'
import './style.less'

export const IconFont: FC<{
  type: string
  style?: React.CSSProperties
}> = ({ type, style }) => {
  return (
    <svg style={{ ...style }} className="authing-icon">
      <use xlinkHref={`#${type}`}></use>
    </svg>
  )
}
