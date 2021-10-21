import React, { useState } from 'react'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { MFAEmail } from './core/email'
import { MFAFace } from './core/face'
import { MFAMethods } from './mfaMethods'
import { GuardMFAViewProps, MFAType } from './props'

import './styles.less'

const ComponentsMapping: Record<MFAType, (props: any) => React.ReactNode> = {
  [MFAType.EMAIL]: (props) => (
    <MFAEmail mfaToken={props.mfaToken} email={props.email} />
  ),
  [MFAType.SMS]: () => <div>sms</div>,
  [MFAType.TOTP]: () => <div>TOTP</div>,
  [MFAType.FACE]: (props) => <MFAFace config={props.config} />,
}

export const GuardMFAView: React.FC<GuardMFAViewProps> = ({
  initData,
  config,
  __changeModule,
}) => {
  const [currentMethod, setCurrentMethod] = useState(
    // initData.applicationMfa.sort((a, b) => a.sort - b.sort)[0].mfaPolicy
    MFAType.FACE
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
      {ComponentsMapping[currentMethod]({ config: config, ...initData })}
      <MFAMethods
        applicationMfa={[
          { mfaPolicy: MFAType.SMS, status: 1, sort: 1 },
          { mfaPolicy: MFAType.EMAIL, status: 1, sort: 2 },
          { mfaPolicy: MFAType.TOTP, status: 1, sort: 3 },
          { mfaPolicy: MFAType.FACE, status: 1, sort: 4 },
        ]}
        method={currentMethod}
        onChangeMethod={(type) => {
          setCurrentMethod(type)
        }}
      />
    </div>
  )
}
