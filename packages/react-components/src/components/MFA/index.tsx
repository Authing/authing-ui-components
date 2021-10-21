import React, { useState } from 'react'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { MFAEmail } from './core/email'
import { MFASms } from './core/sms'
import { MFAFace } from './core/face'
import { MFAMethods } from './mfaMethods'
import { GuardMFAViewProps, MFAType } from './props'

import './styles.less'
import { MFATotp } from './core/totp'

const ComponentsMapping: Record<MFAType, (props: any) => React.ReactNode> = {
  [MFAType.EMAIL]: ({ initData }) => (
    <MFAEmail mfaToken={initData.mfaToken} email={initData.email} />
  ),
  [MFAType.SMS]: ({ initData }) => (
    <MFASms mfaToken={initData.mfaToken} phone={initData.phone} />
  ),
  [MFAType.TOTP]: ({ initData, changeModule }) => (
    <MFATotp
      mfaToken={initData.mfaToken}
      totpMfaEnabled={initData.totpMfaEnabled}
      code={initData.code}
      changeModule={changeModule}
    />
  ),
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
      <div className="g2-mfa-content">
        {ComponentsMapping[currentMethod]({
          config: config,
          initData: initData,
          changeModule: __changeModule,
        })}
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
