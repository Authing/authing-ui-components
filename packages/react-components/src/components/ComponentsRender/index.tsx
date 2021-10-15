import { ConfigProvider } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IG2Config, IG2FCProps } from 'src/classes'
import { initI18n } from 'src/locales'
import { initConfig } from 'src/utils/config'
import { initGuardHttp } from 'src/utils/guradHttp'
import { initAuthClient } from '../Guard/authClient'
import { Spin } from '../Spin'

export interface ComponentsRenderProps extends IG2FCProps {
  component: any
}
const PREFIX_CLS = 'authing-ant'

export const ComponentsRender: React.FC<ComponentsRenderProps> = ({
  appId,
  config,
  initData,
  component,
}) => {
  const [guardConfig, setGuardConfig] = useState<IG2Config>()
  const [initSettingEnd, setInitSettingEnd] = useState(false)

  const init = useCallback(async () => {
    const { config: mergedConfig, publicConfig } = await initConfig(
      appId,
      config ?? {},
      {}
    )

    setGuardConfig(mergedConfig)

    const httpClient = initGuardHttp(mergedConfig?.host!)
    httpClient.setAppId(appId)
    httpClient.setUserpoolId(publicConfig.userPoolId)

    initI18n({}, mergedConfig.lang)

    initAuthClient(config, appId)

    setInitSettingEnd(true)
  }, [appId, config])

  useEffect(() => {
    init()
  }, [init])

  const renderComponent = useMemo(() => {
    if (initSettingEnd) {
      return component({
        appId,
        config: guardConfig,
        initData,
      })
    } else {
      return <Spin />
    }
  }, [appId, component, guardConfig, initData, initSettingEnd])

  return (
    <ConfigProvider prefixCls={PREFIX_CLS}>{renderComponent}</ConfigProvider>
  )
}
