import React from 'react'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { BindMFAEmail, MFAEmail } from './core/email'
import { MFAMethods } from './mfaMethods'
import { GuardMFAViewProps, MFAType } from './props'

import './styles.less'

export const GuardMFAView: React.FC<GuardMFAViewProps> = ({
  initData,
  __changeModule,
}) => {
  console.log('props', initData)

  const onBack = () => __changeModule?.(GuardModuleType.LOGIN, {})

  return (
    <div className="g2-view-container">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>返回登录</span>
        </span>
      </div>
      <MFAEmail mfaToken={initData.mfaToken} email={initData.email} />
      <MFAMethods
        applicationMfa={[
          { mfaPolicy: MFAType.SMS, status: 1, sort: 1 },
          { mfaPolicy: MFAType.EMAIL, status: 1, sort: 2 },
          { mfaPolicy: MFAType.TOTP, status: 1, sort: 3 },
          { mfaPolicy: MFAType.FACE, status: 1, sort: 4 },
        ]}
      />
    </div>
  )
}
