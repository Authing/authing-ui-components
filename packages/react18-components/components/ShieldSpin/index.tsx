import React from 'react'
import { useGuardPublicConfig } from '../_utils/context'

//@ts-ignore
import { ReactComponent as ShieldSpinLoading } from './loading.svg'
interface IG2SpinProps {
  size?: number
}

export const ShieldSpin = (props: IG2SpinProps) => {
  const publicConfig = useGuardPublicConfig()
  let size = props.size ? props.size : 50

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
    >
      {publicConfig?.customLoading ? (
        <img src={publicConfig.customLoading} alt="" width={size} />
      ) : (
        <ShieldSpinLoading />
      )}
    </div>
  )
}

export const Spin = () => (
  <div className="g2-init-setting-loading">
    <ShieldSpin size={100} />
  </div>
)
