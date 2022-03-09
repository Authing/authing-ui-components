import { ConfigProvider, message, Modal } from 'antd'
import React, { useEffect, useMemo } from 'react'
import { GuardModuleType, GuardProps } from '..'
import { GuardBindTotpView } from '../../BindTotp'
import { GuardChangePassword } from '../../ChangePassword'
import { GuardCompleteInfoView } from '../../CompleteInfo'
import { GuardDownloadATView } from '../../DownloadAuthenticator'
import { GuardErrorView } from '../../Error'
import { GuardForgetPassword } from '../../ForgetPassword'
import { GuardLoginView } from '../../Login'
import { GuardMFAView } from '../../MFA'
import { GuardNeedHelpView } from '../../NeedHelpView'
import { GuardRecoveryCodeView } from '../../RecoveryCode'
import { GuardRegisterView } from '../../Register'
import { GuardSubmitSuccessView } from '../../SubmitSuccess'
import {
  useGuardContextLoaded,
  useGuardCurrentModule,
  useGuardDefaultMergedConfigContext,
  useGuardHttpClient,
  useGuardModule,
} from '../../_utils/context'
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import { i18n } from '../../_utils/locales'
import { GuardMode } from '../..'
import { IconFont } from '../../IconFont'
import { AuthingResponse } from '../../_utils/http'
import {
  CodeAction,
  ChangeModuleApiCodeMapping,
} from '../../_utils/responseManagement/interface'

const PREFIX_CLS = 'authing-ant'

message.config({
  prefixCls: `${PREFIX_CLS}-message`,
})

export enum LangMAP {
  zhCn = 'zh-CN',
  enUs = 'en-US',
}

const langMap = {
  [LangMAP.zhCn]: zhCN,
  [LangMAP.enUs]: enUS,
}

export const RenderModule: React.FC<{
  guardProps: GuardProps
}> = ({ guardProps }) => {
  const defaultMergedConfig = useGuardDefaultMergedConfigContext()

  const contextLoaded = useGuardContextLoaded()

  const { moduleName } = useGuardCurrentModule()

  const httpClient = useGuardHttpClient()

  const { changeModule } = useGuardModule()

  const loadingComponent = useMemo(() => {
    return defaultMergedConfig.loadingComponent
  }, [defaultMergedConfig])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ComponentsMapping: Record<GuardModuleType, () => React.ReactNode> = {
    [GuardModuleType.ERROR]: () => <GuardErrorView />,
    [GuardModuleType.LOGIN]: () => <GuardLoginView />,
    [GuardModuleType.IDENTITY_BINDING]: () => <GuardLoginView />,
    [GuardModuleType.IDENTITY_BINDING_ASK]: () => <GuardNeedHelpView />,
    [GuardModuleType.MFA]: () => <GuardMFAView />,
    [GuardModuleType.REGISTER]: () => <GuardRegisterView />,
    [GuardModuleType.DOWNLOAD_AT]: () => <GuardDownloadATView />,
    [GuardModuleType.FORGET_PWD]: () => <GuardForgetPassword />,
    [GuardModuleType.CHANGE_PWD]: () => <GuardChangePassword />,
    [GuardModuleType.BIND_TOTP]: () => <GuardBindTotpView />,
    [GuardModuleType.ANY_QUESTIONS]: () => <GuardNeedHelpView />,
    [GuardModuleType.COMPLETE_INFO]: () => <GuardCompleteInfoView />,
    [GuardModuleType.RECOVERY_CODE]: () => <GuardRecoveryCodeView />,
    [GuardModuleType.SUBMIT_SUCCESS]: () => <GuardSubmitSuccessView />,
  }

  // 初始化 请求拦截器 （Error Code）
  useEffect(() => {
    if (!httpClient || !changeModule) return

    // 错误码处理回调 切换 module 和 错误信息提示
    const errorCodeCb = (code: CodeAction, res: AuthingResponse) => {
      const codeActionMapping = {
        [CodeAction.CHANGE_MODULE]: (res: AuthingResponse) => {
          const nextModule = ChangeModuleApiCodeMapping[res.apiCode!]

          const nextData = res.data

          changeModule(nextModule, nextData)
        },
        [CodeAction.RENDER_MESSAGE]: (res: AuthingResponse) => {
          message.error(res.message ?? res.messages)
        },
      }

      const codeAction = codeActionMapping[code]

      codeAction(res)
    }

    httpClient.initErrorCodeInterceptor(errorCodeCb)
  }, [httpClient, changeModule])

  const renderModule = useMemo(() => {
    if (contextLoaded) {
      return ComponentsMapping[moduleName]()
    } else if (loadingComponent) {
      return loadingComponent
    }
    return null
  }, [ComponentsMapping, contextLoaded, loadingComponent, moduleName])

  return (
    <ConfigProvider
      prefixCls={PREFIX_CLS}
      locale={langMap[i18n.language as LangMAP]}
    >
      {defaultMergedConfig.mode === GuardMode.Modal ? (
        <Modal
          className="authing-g2-render-module-modal"
          closeIcon={
            <IconFont type="authing-close-line" className="g2-modal-close" />
          }
          visible={guardProps.visible}
          onCancel={guardProps?.onClose}
          keyboard={defaultMergedConfig.escCloseable}
          maskClosable={false} // 点击蒙层，是否允许关闭
          getContainer={defaultMergedConfig.target ?? false}
        >
          <div className="authing-g2-render-module">{renderModule}</div>
        </Modal>
      ) : (
        <div className="authing-g2-render-module">{renderModule}</div>
      )}
    </ConfigProvider>
  )
}
