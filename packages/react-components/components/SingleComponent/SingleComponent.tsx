import { useRenderGuardCore } from '../Guard/core'
import { GuardModuleType, IG2FCProps } from '..'

export function SingleComponent<T extends IG2FCProps>(
  props: T,
  guardModuleType: GuardModuleType,
  initData?: any
): JSX.Element {
  const renderGuard = useRenderGuardCore(props, {
    moduleName: guardModuleType,
    initData,
  })

  return renderGuard
}
