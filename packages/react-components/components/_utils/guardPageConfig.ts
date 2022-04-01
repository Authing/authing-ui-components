import { useCallback, useEffect, useState } from 'react'
import { GuardPageConfig } from '..'
import { GuardHttp } from './guardHttp'
import { AuthingResponse } from './http'
import { Logger } from './logger'

let pageConfigMap: Record<string, GuardPageConfig> = {}

export const getPageConfig = (appId: string) => pageConfigMap?.[appId]

export const setPageConfig = (appId: string, config: GuardPageConfig) =>
  (pageConfigMap[appId] = config)

export const requestGuardPageConfig = async (
  appId: string,
  httpClient: GuardHttp
): Promise<GuardPageConfig> => {
  let res: AuthingResponse<GuardPageConfig>

  const { get } = httpClient

  try {
    res = await get<GuardPageConfig>(
      `/api/v2/applications/${appId}/components-public-config/guard`
    )
  } catch (error) {
    Logger.error('Please check your config or network')
    throw new Error('Please check your config or network')
  }

  if (res.code !== 200 || !res.data) {
    Logger.error(res?.message ?? 'Please check your config')
    throw new Error(res?.message ?? 'Please check your config')
  }

  setPageConfig(appId, res.data)

  return getPageConfig(appId)
}

export const useGuardPageConfig = (
  appId: string,
  httpClient?: GuardHttp,
  serError?: any
) => {
  const [pageConfig, setPageConfig] = useState<GuardPageConfig>()

  const initPublicConfig = useCallback(async () => {
    if (httpClient && appId)
      if (!getPageConfig(appId)) {
        try {
          await requestGuardPageConfig(appId, httpClient)
        } catch (error) {
          serError(error)
        }
      }

    setPageConfig(getPageConfig(appId))
  }, [appId, httpClient, serError])

  useEffect(() => {
    initPublicConfig()
  }, [initPublicConfig])

  if (pageConfig) {
    return pageConfig
  }
}
