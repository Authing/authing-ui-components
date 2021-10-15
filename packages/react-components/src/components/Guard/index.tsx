import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ConfigProvider } from 'antd'

import { GuardLoginView } from '../Login'

import { initAuthClient } from './authClient'
import { GuardEvents, guardEventsFilter } from './event'
import { initConfig, GuardConfig } from 'src/utils/config'
import { initGuardHttp } from 'src/utils/guradHttp'
import { initI18n } from 'src/locales'
import { IG2FCProps } from 'src/classes'
import { getDefaultGuardConfig } from './config'
import { Spin } from '../Spin'
import { GuardModuleType } from './module'
import { GuardMFA } from '../MFA'
import './styles.less'

const PREFIX_CLS = 'authing-ant'

const ComponentsMapping: Record<
  GuardModuleType,
  (props: IG2FCProps) => React.ReactNode
> = {
  [GuardModuleType.LOGIN]: (props) => <GuardLoginView {...props} />,
  [GuardModuleType.MFA]: (props) => <GuardMFA {...props} />,
}

export interface GuardProps extends GuardEvents {
  appId: string
  config?: GuardConfig
}

export const Guard = (props: GuardProps) => {
  const { appId, config, onLoad, onLoadError } = props
  const [module, setModule] = useState<GuardModuleType>(GuardModuleType.LOGIN)
  const [initData, setInitData] = useState({})
  const [initSettingEnd, setInitSettingEnd] = useState(false)
  const [guardConfig, setGuardConfig] = useState<GuardConfig>({})
  // const [client, setClient] = useState<AuthenticationClient>()
  const events = guardEventsFilter(props)

  // 切换 module
  const onChangeModule = (moduleName: GuardModuleType, initData?: any) => {
    setModule(moduleName)
    initData && setInitData(initData)
  }

  // 拿 code 换 action，返回可执行函数
  // const codePaser = (code: number) => {
  //   // console.log('code', code)
  //   const action = moduleCodeMap[code]
  //   if (code === 200) {
  //     return (data: any) => {
  //       // console.log('登录成功 执行登录业务', data)
  //       props.onLogin?.(data, client!) // 登录成功
  //     }
  //   }

  //   if (!action) {
  //     return () => {
  //       console.error('未捕获 code', code)
  //     }
  //   }

  //   // 解析成功
  //   if (action?.action === 'changeModule') {
  //     return (initData?: any) => onChangeModule?.(action.module, initData)
  //   }

  //   // 最终结果
  //   return () => {
  //     console.error('last action')
  //   }
  // }

  // TODO 初始化的 Loging
  const initGuardSetting = useCallback(async () => {
    try {
      const { config: mergedConfig, publicConfig } = await initConfig(
        appId,
        config ?? {},
        getDefaultGuardConfig()
      )

      setGuardConfig(mergedConfig)

      const httpClient = initGuardHttp(mergedConfig?.host!)
      httpClient.setAppId(appId)
      httpClient.setUserpoolId(publicConfig.userPoolId)

      // TODO 这部分有点小问题 等待优化
      initI18n({}, mergedConfig.lang)

      const authClient = initAuthClient(config, appId)
      // setClient(authClient)
      onLoad?.(authClient)
      // 初始化 结束
      setInitSettingEnd(true)
    } catch (error) {
      onLoadError?.(error)

      console.error(error)
    }
  }, [appId, config, onLoad, onLoadError])

  useEffect(() => {
    initGuardSetting()
  }, [initGuardSetting])

  const renderModule = useMemo(() => {
    if (initSettingEnd) {
      return ComponentsMapping[module]({
        appId,
        initData,
        config: guardConfig,
        ...events,
        __changeModule: onChangeModule,
        // __codePaser: codePaser,
      })
    } else {
      return <Spin />
    }
  }, [appId, events, guardConfig, initData, initSettingEnd, module])

  return (
    // TODO 这部分缺失 Loging 态
    <ConfigProvider prefixCls={PREFIX_CLS}>
      <div className="authing-g2-render-module">{renderModule}</div>
    </ConfigProvider>
  )
}
