import { ConfigProvider, message, Modal } from 'antd'
import React, { useEffect, useMemo } from 'react'
import { GuardModuleType, GuardProps } from '..'
import { GuardBindTotpView } from '../../BindTotp'
import { GuardChangePassword } from '../../ChangePassword'
import {
  GuardLoginCompleteInfoView,
  GuardRegisterCompleteInfoView,
} from '../../CompleteInfo'
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
  useGuardDefaultMergedConfig,
  useGuardHttpClient,
  useGuardModule,
} from '../../_utils/context'
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import { i18n } from '../../_utils/locales'
import { GuardMode } from '../..'
import { IconFont } from '../../IconFont'
import { AuthingGuardResponse, AuthingResponse } from '../../_utils/http'
import {
  CodeAction,
  ChangeModuleApiCodeMapping,
} from '../../_utils/responseManagement/interface'
import { GuardIdentityBindingView } from '../../IdentityBinding'
import { GuardIdentityBindingAskView } from '../../IdentityBindingAsk'

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
  const defaultMergedConfig = useGuardDefaultMergedConfig()

  const contextLoaded = useGuardContextLoaded()

  const { moduleName } = useGuardCurrentModule()

  const httpClient = useGuardHttpClient()

  const { changeModule } = useGuardModule()

  const loadingComponent = useMemo(() => {
    return defaultMergedConfig.loadingComponent
  }, [defaultMergedConfig])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ComponentsMapping: Record<GuardModuleType, () => React.ReactNode> = {
    // Error
    [GuardModuleType.ERROR]: () => <GuardErrorView />,
    // Login
    [GuardModuleType.LOGIN]: () => <GuardLoginView />,
    // 身份源绑定
    [GuardModuleType.IDENTITY_BINDING]: () => <GuardIdentityBindingView />,
    // 身份源绑定 问询
    [GuardModuleType.IDENTITY_BINDING_ASK]: () => (
      <GuardIdentityBindingAskView />
    ),
    // MFA
    [GuardModuleType.MFA]: () => <GuardMFAView />,
    // 注册
    [GuardModuleType.REGISTER]: () => <GuardRegisterView />,
    // 下载 Authenticator
    [GuardModuleType.DOWNLOAD_AT]: () => <GuardDownloadATView />,
    // 忘记密码 -> 重置密码
    [GuardModuleType.FORGET_PWD]: () => <GuardForgetPassword />,
    // 首次登录修改密码 && 密码过期
    [GuardModuleType.CHANGE_PWD]: () => <GuardChangePassword />,
    // 绑定 TOTP
    [GuardModuleType.BIND_TOTP]: () => <GuardBindTotpView />,
    // 问题反馈
    [GuardModuleType.ANY_QUESTIONS]: () => <GuardNeedHelpView />,
    // MFA 恢复码
    [GuardModuleType.RECOVERY_CODE]: () => <GuardRecoveryCodeView />,
    // 提交成功
    [GuardModuleType.SUBMIT_SUCCESS]: () => <GuardSubmitSuccessView />,
    // 注册信息补全
    [GuardModuleType.REGISTER_COMPLETE_INFO]: () => (
      <GuardRegisterCompleteInfoView />
    ),
    // 登录信息补全
    [GuardModuleType.LOGIN_COMPLETE_INFO]: () => <GuardLoginCompleteInfoView />,
  }

  // 初始化 请求拦截器 （Error Code）
  useEffect(() => {
    if (!httpClient || !changeModule) return

    // 错误码处理回调 切换 module 和 错误信息提示
    const errorCodeCb = (
      code: CodeAction,
      res: AuthingResponse
    ): AuthingGuardResponse => {
      const codeActionMapping = {
        [CodeAction.CHANGE_MODULE]: () => {
          const nextModule = ChangeModuleApiCodeMapping[res.apiCode!]

          const nextData = res.data

          changeModule(nextModule, nextData)
        },
        [CodeAction.RENDER_MESSAGE]: () => {
          message.error(res.message ?? res.messages)
        },
      }

      const codeAction = codeActionMapping[code]

      if (!codeAction) return res

      return {
        ...res,
        onGuardHandling: codeAction,
      }
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
