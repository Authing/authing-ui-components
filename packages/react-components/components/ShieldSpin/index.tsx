import React from 'react'

//@ts-ignore
import { ReactComponent as ShieldSpinLoading } from './loading.svg'
interface IG2SpinProps {
  size?: number
}

export const ShieldSpin = (props: IG2SpinProps) => {
  let size = props.size ? props.size : 50

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
    >
      <ShieldSpinLoading />
    </div>
  )
}

export const Spin = () => (
  <div className="g2-init-setting-loading">
    <ShieldSpin size={100} />
  </div>
)
