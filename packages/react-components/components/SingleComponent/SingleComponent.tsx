import { ConfigProvider, message } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AuthenticationClient,
  getDefaultGuardLocalConfig,
  GuardEvents,
  guardEventsFilter,
  GuardLocalConfig,
  IG2FCProps,
  initConfig,
  LangMAP,
} from '..'
import { ApplicationConfig } from '../AuthingGuard/api'
import { initGuardAuthClient } from '../Guard/authClient'
import { insertStyles } from '../_utils'
import { getGuardHttp, GuardHttp, initGuardHttp } from '../_utils/guradHttp'
import { i18n, initI18n } from '../_utils/locales'
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import { createGuardContext } from '../_utils/context'
import { ShieldSpin } from '../ShieldSpin'
import { GuardErrorView } from '../Error'

const langMap = {
  [LangMAP.zhCn]: zhCN,
  [LangMAP.enUs]: enUS,
}
const PREFIX_CLS = 'authing-ant'

message.config({
  prefixCls: `${PREFIX_CLS}-message`,
})
const { Context } = createGuardContext()

export function SingleComponent<T extends IG2FCProps>(
  props: T,
  Component: React.FC<any>
): JSX.Element {
  const { appId, config } = props

  const [initSettingEnd, setInitSettingEnd] = useState(false)
  const [initError, setInitError] = useState(false)
  const [errorData, setErrorData] = useState<any>()
  const [GuardLocalConfig, setGuardLocalConfig] = useState<GuardLocalConfig>()

  const [events, setEvents] = useState<GuardEvents>()
  const [authClint, setAuthClint] = useState<AuthenticationClient>()
  const [httpClint, setHttpClint] = useState<GuardHttp>()
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()

  // HttpClint
  useEffect(() => {
    if (!appId) return

    const httpClient = initGuardHttp(
      config?.host ?? getDefaultGuardLocalConfig().host
    )
    httpClient.setAppId(appId)
    setHttpClint(httpClient)
  }, [appId, config?.host])

  useEffect(() => {
    if (httpClint && GuardLocalConfig && GuardLocalConfig.__appHost__) {
      httpClint?.setBaseUrl(GuardLocalConfig.__appHost__)
    }
  }, [GuardLocalConfig, httpClint])

  // I18n
  useEffect(() => {
    // TODO  国际化 这部分有点小问题 等待优化
    initI18n({}, config?.lang)
  }, [config?.lang])

  // AuthClient
  useEffect(() => {
    if (appId && GuardLocalConfig) {
      const authClint = initGuardAuthClient(GuardLocalConfig, appId)
      setAuthClint(authClint)
    }
  }, [GuardLocalConfig, appId])

  // initEvents
  useEffect(() => {
    const events = guardEventsFilter(props, GuardLocalConfig?.openEventsMapping)
    setEvents(events)
  }, [GuardLocalConfig, props])

  const initPublicConfig = useCallback(async () => {
    if (!config && !appId) return
    try {
      // Config 初始化
      const { config: mergedConfig, publicConfig } = await initConfig(
        appId,
        config ?? {},
        getDefaultGuardLocalConfig()
      )

      setGuardLocalConfig(mergedConfig)
      setPublicConfig(publicConfig)

      getGuardHttp().setUserpoolId(publicConfig.userPoolId)
    } catch (error: any) {
      setErrorData(error)
      setInitError(true)
    } finally {
      // 初始化 结束
      setInitSettingEnd(true)
    }
  }, [appId, config])

  useEffect(() => {
    initPublicConfig()
  }, [initPublicConfig])

  useEffect(() => {
    if (GuardLocalConfig && GuardLocalConfig.contentCss)
      insertStyles(GuardLocalConfig.contentCss)
  }, [GuardLocalConfig])

  useEffect(() => {
    if (GuardLocalConfig && authClint) events?.onLoad?.(authClint)
  }, [GuardLocalConfig, authClint, events])

  useEffect(() => {
    if (initError) {
      events?.onLoadError?.(errorData)
    }
  }, [errorData, events, initError])

  const renderModule = useMemo(() => {
    if (initError)
      return <GuardErrorView initData={{ messages: errorData?.message }} />
    if (initSettingEnd && GuardLocalConfig) {
      //   return ComponentsMapping[moduleState.moduleName]({
      //     appId,
      //     initData: moduleState.initData,
      //     config: GuardLocalConfig,
      //     ...events,
      //     __changeModule: (moduleName, initData) => {
      //       historyNext(initData)
      //       guardStateMachine?.next(moduleName, initData)
      //     },
      //   })
      return <Component {...props} config={GuardLocalConfig} />
    } else {
      return (
        <div className="g2-init-setting-loading">
          <ShieldSpin size={100} />
        </div>
      )
    }
  }, [
    Component,
    GuardLocalConfig,
    errorData?.message,
    initError,
    initSettingEnd,
    props,
  ])

  return (
    <ConfigProvider
      prefixCls={PREFIX_CLS}
      locale={langMap[i18n.language as LangMAP]}
    >
      <Context.Provider value={publicConfig}>
        <div className="authing-g2-render-module">{renderModule}</div>
      </Context.Provider>
    </ConfigProvider>
  )
}
