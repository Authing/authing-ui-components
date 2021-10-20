import { Button } from 'antd'
import React, { useMemo, useState } from 'react'
import { GuardMFAInitData, MFAType } from '../props'
import './style.less'

export interface MFAMethodsProps {
  applicationMfa: GuardMFAInitData['applicationMfa']
  method: MFAType
  onChangeMethod: (type: MFAType) => void
}

const methodTitleMapping: Record<
  MFAType,
  {
    title: string
    icon: string
  }
> = {
  [MFAType.EMAIL]: {
    title: '手机验证',
    icon: '',
  },
  [MFAType.SMS]: {
    title: '电子邮箱验证',
    icon: '',
  },
  [MFAType.TOTP]: {
    title: 'OTP 口令验证',
    icon: '',
  },
  [MFAType.FACE]: {
    title: '人脸识别',
    icon: '',
  },
}

export const MFAMethods: React.FC<MFAMethodsProps> = ({
  applicationMfa = [],
  method,
  onChangeMethod,
}) => {
  const [currentMethod, setCurrentMethod] = useState(method)

  const otherMethods = useMemo(
    () =>
      applicationMfa
        .filter((item) => item.mfaPolicy !== currentMethod)
        .sort((a, b) => a.sort - b.sort)
        .map((item) => (
          <Button
            className="g2-guard-mfa-methods-btn"
            onClick={(e) => {
              onChangeMethod(item.mfaPolicy)
              setCurrentMethod(item.mfaPolicy)
            }}
            key={item.mfaPolicy}
          >
            {methodTitleMapping[item.mfaPolicy].title}
          </Button>
        )),
    [applicationMfa, currentMethod, onChangeMethod]
  )
  return (
    <>
      <div className="g2-social-login-title">其他验证方式</div>
      {otherMethods}
    </>
  )
}
