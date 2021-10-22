import React, { useState } from 'react'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { MFAEmail } from './core/email'
import { MFASms } from './core/sms'
import { MFAFace } from './core/face'
import { MFATotp } from './core/totp'
import { MFAMethods } from './mfaMethods'
import { GuardMFAViewProps, MFAType } from './props'
import { useAuthClient } from '../Guard/authClient'
import { codeMap } from './codemap'
import './styles.less'

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
  [MFAType.FACE]: ({ config, initData, mfaLogin }) => (
    <MFAFace config={config} initData={initData} mfaLogin={mfaLogin} />
  ),
}

export const GuardMFAView: React.FC<GuardMFAViewProps> = ({
  initData,
  config,
  __changeModule,
  onLogin,
}) => {
  const [currentMethod, setCurrentMethod] = useState(
    // initData.applicationMfa.sort((a, b) => a.sort - b.sort)[0].mfaPolicy
    MFAType.FACE
  )
  const client = useAuthClient()

  const onBack = () => __changeModule?.(GuardModuleType.LOGIN, {})

  const __codePaser = (code: number) => {
    const action = codeMap[code]
    if (code === 200) {
      return (data: any) => {
        onLogin?.(data, client) // 登录成功
      }
    }

    if (!action) {
      return () => {
        console.error('未捕获 code', code)
        // props.onLoginError?.(data, client) // 未捕获 code
      }
    }

    // 解析成功
    if (action?.action === 'changeModule') {
      let m = action.module ? action.module : GuardModuleType.ERROR
      return (initData?: any) => __changeModule?.(m, initData)
    }
    if (action?.action === 'insideFix') {
      return () => {}
    }
    // 最终结果
    return () => {
      // props.onLoginError?.(data, client!) // 未捕获 code
      console.error('last action at mfaview')
    }
  }

  const mfaLogin = (code: any, data: any, message?: string) => {
    const callback = __codePaser?.(code)
    if (!data) {
      data = {}
    }
    data.__message = message
    callback?.(data)
  }

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
          mfaLogin: mfaLogin,
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
