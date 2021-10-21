import React, { useState } from 'react'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { MFAEmail } from './core/email'
import { MFASms } from './core/sms'
import { MFAMethods } from './mfaMethods'
import { GuardMFAViewProps, MFAType } from './props'

import './styles.less'

const ComponentsMapping: Record<MFAType, (props: any) => React.ReactNode> = {
  [MFAType.EMAIL]: (props) => (
    <MFAEmail mfaToken={props.mfaToken} email={props.email} />
  ),
  [MFAType.SMS]: (props) => (
    <MFASms mfaToken={props.mfaToken} phone={props.phone} />
  ),
  [MFAType.TOTP]: () => <div>TOTP</div>,
  [MFAType.FACE]: () => <div>face</div>,
}

export const GuardMFAView: React.FC<GuardMFAViewProps> = ({
  initData,
  __changeModule,
}) => {
  console.log('mfa initData', initData)
  const [currentMethod, setCurrentMethod] = useState(
    initData.applicationMfa?.sort((a, b) => a.sort - b.sort)[0].mfaPolicy ??
      MFAType.EMAIL
  )

  const onBack = () => __changeModule?.(GuardModuleType.LOGIN, {})

  return (
    <div className="g2-view-container">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>返回登录</span>
        </span>
      </div>
      <div className="g2-mfa-content">
        {ComponentsMapping[currentMethod]({ ...initData })}
      </div>
      <MFAMethods
        applicationMfa={initData.applicationMfa}
        method={currentMethod}
        onChangeMethod={(type) => {
          setCurrentMethod(type)
        }}
      />
    </div>
  )
}
