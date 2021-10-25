import React from 'react'
import { ReactComponent as LoadShielding } from './loading.svg'

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
      <LoadShielding />
    </div>
  )
}
