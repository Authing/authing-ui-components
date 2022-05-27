import { useEffect } from 'react'
import { GuardAppendConfig, setPublicConfig } from '../..'
import { initAppendConfig } from '../../_utils/appendConfig'
import { setPageConfig } from '../../_utils/config'
import { getGuardDocument } from '../../_utils/guardDocument'

export const getGuardWindow = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const guardDocument = getGuardDocument()

  const guardWindow = guardDocument?.defaultView

  if (guardWindow) {
    return guardWindow
  }

  return window
}

export const useGuardWindow = getGuardWindow

export const useInitGuardAppendConfig = (
  appId?: string,
  appendConfig?: GuardAppendConfig
) => {
  useEffect(() => {
    if (!appId) return

    initAppendConfig(appendConfig)

    if (appendConfig?.publicConfig) {
      setPublicConfig(appId, appendConfig.publicConfig)
    }

    if (appendConfig?.pageConfig) {
      setPageConfig(appId, appendConfig.pageConfig)
    }
  }, [appId, appendConfig])
}
