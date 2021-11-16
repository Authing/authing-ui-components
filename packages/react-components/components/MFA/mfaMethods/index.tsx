import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'antd'
import { IconFont } from '../../IconFont'
import { GuardMFAInitData, MFAType } from '../props'
import { i18n } from '../../_utils/locales'
import './style.less'

export interface MFAMethodsProps {
  applicationMfa: GuardMFAInitData['applicationMfa']
  method: MFAType
  onChangeMethod: (type: MFAType) => void
}

const methodTitleMapping: Record<
  MFAType,
  {
    title: () => string
    icon: string
  }
> = {
  [MFAType.EMAIL]: {
    title: () => i18n.t('common.EmailVerification'),
    icon: 'authing-mail',
  },
  [MFAType.SMS]: {
    title: () => i18n.t('common.SMS'),
    icon: 'authing-phone',
  },
  [MFAType.TOTP]: {
    title: () => i18n.t('common.OTPVerification'),
    icon: 'authing-totp',
  },
  [MFAType.FACE]: {
    title: () => i18n.t('common.faceVerification'),
    icon: 'authing-face',
  },
}

export const MFAMethods: React.FC<MFAMethodsProps> = ({
  applicationMfa = [],
  method,
  onChangeMethod,
}) => {
  const [currentMethod, setCurrentMethod] = useState(method)
  const { t } = useTranslation()

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
            <IconFont type={methodTitleMapping[item.mfaPolicy].icon} />
            {`${methodTitleMapping[item.mfaPolicy].title()}`}
          </Button>
        )),
    [applicationMfa, currentMethod, onChangeMethod]
  )

  return (
    <>
      {otherMethods.length !== 0 && (
        <>
          <div
            style={{
              minHeight: 32,
            }}
          />
          <div className="g2-mfa-method">
            <div className="g2-mfa-method-title">
              {t('login.otherVerifyWay')}
            </div>
            {otherMethods}
          </div>
        </>
      )}
    </>
  )
}
