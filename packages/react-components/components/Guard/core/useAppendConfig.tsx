import { GuardProps } from '../..'
import { getAppendConfig, initAppendConfig } from '../../_utils/appendConfig'
import { setPublicConfig, setPageConfig } from '../../_utils/config/index'
export const getGuardWindow = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const appendConfig = getAppendConfig()

  if (appendConfig?.window) return appendConfig.window

  return window
}

export const useGuardWindow = getGuardWindow

export const useInitGuardAppendConfig = (guardProps: GuardProps) => {
  const { appendConfig, appId } = guardProps

  console.log('================')
  console.log(appendConfig)
  console.log('================')

  initAppendConfig(appendConfig)

  if (appendConfig?.publicConfig) {
    setPublicConfig(appId, appendConfig.publicConfig)
  }

  if (appendConfig?.pageConfig) {
    setPageConfig(appId, appendConfig.pageConfig)
  }
}
