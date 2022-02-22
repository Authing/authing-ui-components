import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GuardModuleType } from '../Guard/module'
import { IconFont } from '../IconFont'
import { MFAEmail } from './core/email'
import { MFASms } from './core/sms'
import { MFAFace } from './core/face'
import { MFATotp } from './core/totp'
import { MFAMethods } from './mfaMethods'
import { GuardMFAViewProps, MFAType } from './interface'
import { useGuardAuthClient } from '../Guard/authClient'
import { codeMap } from './codemap'
import './styles.less'
import { message } from 'antd'
import { shoudGoToComplete } from '../_utils'
import { usePublicConfig } from '../_utils/context'
interface MFABackStateContextType {
  setMfaBackState: React.Dispatch<React.SetStateAction<string>>
  mfaBackState: string
}
export const MFABackStateContext = React.createContext<
  MFABackStateContextType | undefined
>(undefined)

const ComponentsMapping: Record<MFAType, (props: any) => React.ReactNode> = {
  [MFAType.EMAIL]: ({ config, initData, mfaLogin }) => (
    <MFAEmail
      config={config}
      mfaToken={initData.mfaToken}
      email={initData.email}
      mfaLogin={mfaLogin}
    />
  ),
  [MFAType.SMS]: ({ config, initData, mfaLogin }) => (
    <MFASms
      config={config}
      mfaToken={initData.mfaToken}
      phone={initData.phone}
      mfaLogin={mfaLogin}
    />
  ),
  [MFAType.TOTP]: ({ initData, config, changeModule, mfaLogin }) => (
    <MFATotp
      changeModule={changeModule}
      config={config}
      initData={initData}
      mfaLogin={mfaLogin}
    />
  ),
  [MFAType.FACE]: ({ config, initData, mfaLogin, setShowMethods }) => (
    <MFAFace
      config={config}
      initData={initData}
      mfaLogin={mfaLogin}
      setShowMethods={setShowMethods}
    />
  ),
}

export const GuardMFAView: React.FC<GuardMFAViewProps> = ({
  initData,
  config,
  __changeModule,
  onLogin,
}) => {
  const [currentMethod, setCurrentMethod] = useState(
    initData.current ??
      initData.applicationMfa?.sort((a, b) => a.sort - b.sort)[0].mfaPolicy
  )
  const publicConfig = usePublicConfig()
  const [mfaBackState, setMfaBackState] = useState<string>('login')
  const [showMethods, setShowMethods] = useState(true)
  const client = useGuardAuthClient()
  const { t } = useTranslation()
  let { autoRegister } = config
  const onBack = () => {
    if (currentMethod === MFAType.FACE && mfaBackState === 'check') {
      setCurrentMethod(
        initData.applicationMfa.find((item) => item.mfaPolicy === MFAType.FACE)
          ? MFAType.FACE
          : initData.applicationMfa?.sort((a, b) => a.sort - b.sort)[0]
              .mfaPolicy
      )
      setShowMethods(true)
      setMfaBackState('login')
      return
    }
    window.history.back()
  }

  const __codePaser = (code: number, msg?: string) => {
    const action = codeMap[code]

    if (code === 200) {
      return (data: any) => {
        if (shoudGoToComplete(data, 'login', publicConfig, autoRegister)) {
          __changeModule?.(GuardModuleType.COMPLETE_INFO, {
            context: 'login',
            user: data,
          })
        } else {
          onLogin?.(data, client!) // 登录成功
        }
      }
    }

    if (!action) {
      return (data: any) => {
        console.error('not catch code', code)
        message.error(data.message)
      }
    }

    // 解析成功
    if (action?.action === 'changeModule') {
      let m = action.module ? action.module : GuardModuleType.ERROR
      let init = action.initData ? action.initData : {}
      return (initData?: any) => __changeModule?.(m, { ...initData, init })
    }
    if (action?.action === 'insideFix') {
      return () => {}
    }

    if (action?.action === 'message') {
      return (data: any) => {
        data.message ? message.error(data.message) : message.error(msg)
      }
    }

    // 最终结果
    return () => {
      console.error('last action at mfaview')
    }
  }

  const mfaLogin = (code: any, data: any, message?: string) => {
    const callback = __codePaser?.(code, message)

    if (!data) {
      data = {}
    }

    data.__message = message

    callback?.(data)
  }

  return (
    // 返回验证页和返回登录页 需要获取内部 face 模式下的状态
    <MFABackStateContext.Provider
      value={{ setMfaBackState: setMfaBackState, mfaBackState: mfaBackState }}
    >
      <div className="g2-view-container g2-view-mfa">
        <div className="g2-view-back" style={{ display: 'inherit' }}>
          <span onClick={onBack} className="g2-view-mfa-back-hover">
            <IconFont
              type="authing-arrow-left-s-line"
              style={{ fontSize: 24 }}
            />
            <span>
              {currentMethod === MFAType.FACE && mfaBackState === 'check'
                ? t('common.backToVerify')
                : t('common.backLoginPage')}
            </span>
          </span>
        </div>
        <div className="g2-mfa-content">
          {ComponentsMapping[currentMethod]({
            config: config,
            initData: initData,
            changeModule: __changeModule,
            mfaLogin: mfaLogin,
            setShowMethods: setShowMethods,
          })}
        </div>
        {showMethods && (
          <MFAMethods
            applicationMfa={initData.applicationMfa}
            method={currentMethod}
            onChangeMethod={(type) => {
              setCurrentMethod(type)
            }}
          />
        )}
      </div>
    </MFABackStateContext.Provider>
  )
}
