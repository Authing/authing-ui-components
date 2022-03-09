import { GuardEvents } from './event'
import { IG2FCProps } from '../Type'
import { GuardLocalConfig } from './config'
import { GuardModuleType } from './module'
import './styles.less'
import 'moment/locale/zh-cn'
import { useRenderGuardCore } from './core/index'

export interface GuardProps extends GuardEvents, IG2FCProps {
  tenantId?: string
  config?: Partial<GuardLocalConfig>
  visible?: boolean
}

interface ModuleState {
  moduleName: GuardModuleType
  initData: any
}

export const Guard = (props: GuardProps) => {
  const { config } = props

  // 首页 init 数据
  const initState: ModuleState = {
    moduleName: config?.defaultScenes ?? GuardModuleType.LOGIN,
    initData: config?.defaultInitData ?? {},
  }

  const renderGuard = useRenderGuardCore(props, initState)

  return renderGuard
}
