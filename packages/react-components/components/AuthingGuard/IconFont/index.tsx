import React, { FC } from 'react'
import { getClassnames } from '../../_utils'
import './iconfont'
import './style.less'

export const IconFont: FC<{
  type: string
  style?: React.CSSProperties
  className?: string
}> = ({ type, style, className }) => {
  return (
    <svg
      style={{ ...style }}
      className={getClassnames(['authing-icon', className])}
    >
      <use xlinkHref={`#${type}`}></use>
    </svg>
  )
}
