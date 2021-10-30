import React from 'react'
import { IconFont } from '../IconFont'
import { UseCode } from './core/useCode'
import { GuardRecoveryCodeViewProps } from './interface'
import './style.less'
const window: Window = require('global/window')

export const GuardRecoveryCodeView: React.FC<GuardRecoveryCodeViewProps> = ({
  initData,
}) => {
  const onBack = () => window.history.back()

  return (
    <div className="g2-view-container g2-mfa-recovery-code">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>返回验证页</span>
        </span>
      </div>
      <div className="g2-mfa-content">
        <UseCode mfaToken={initData.mfaToken} />
      </div>
    </div>
  )
}
