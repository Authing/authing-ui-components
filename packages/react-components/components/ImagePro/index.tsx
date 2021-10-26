import React, { useState } from 'react'
import { getClassnames } from '../_utils'
import './styles.less'

export interface ImageProProps {
  src: string
  className?: string
  alt?: string
  imgClassName?: string
  size?: number | string
  width?: number | string
  height?: number | string
  borderRadius?: number | string
  noSpin?: boolean
}

export const ImagePro = (props: ImageProProps) => {
  let { borderRadius, noSpin } = props
  let [loaded, setLoaded] = useState(noSpin === true ? true : false)
  let w: number | string = 0
  let h: number | string = 0
  if (props.size) {
    // size 存在，说明是正方形，让宽高等于 size
    w = props.size
    h = props.size
  } else {
    // 如果 size 不存在，说明长方形，尝试读取宽高
    w = props.width ? props.width : 'auto'
    h = props.height ? props.height : 'auto'
  }

  return (
    <div
      style={{ width: w, height: h }}
      className={getClassnames([
        'g2-base-imagepro-container',
        'g2-base-image-background-animation',
        loaded ? 'loaded' : 'unload',
        props?.className,
      ])}
    >
      <img
        src={props.src}
        style={{ width: w, height: h, borderRadius: borderRadius }}
        className="g2-base-imagepro"
        draggable={false}
        alt={props?.alt || 'image'}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
