import { memo } from 'react'

import { GuardEvents } from './event'
import { GuardAppendConfig, IG2FCProps } from '../Type'
import { GuardLocalConfig } from './config'
import { GuardModuleType } from './module'
import 'moment/locale/zh-cn'
import { useRenderGuardCore } from './core/index'
import { GuardPropsFilter } from '../_utils'

export interface GuardProps extends GuardEvents, IG2FCProps {
  config?: Partial<GuardLocalConfig>
  appendConfig?: GuardAppendConfig
}

interface ModuleState {
  moduleName: GuardModuleType
  initData: any
}

const propsAreEqual = (pre: GuardProps, current: GuardProps) => {
  return GuardPropsFilter(pre, current)
}

export const Guard = memo((props: GuardProps) => {
  const { config } = props
  // 首页 init 数据
  const initState: ModuleState = {
    moduleName: config?.defaultScenes ?? GuardModuleType.LOGIN,
    initData: config?.defaultInitData ?? {},
  }

  const renderGuard = useRenderGuardCore(props, initState)

  return renderGuard
}, propsAreEqual)
