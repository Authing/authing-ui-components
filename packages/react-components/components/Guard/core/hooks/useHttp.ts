import { useEffect, useState } from 'react'
import { GuardHttp, initGuardHttp } from '../../../_utils/guardHttp'
import { GuardLocalConfig } from '../../config'

/**
 * 初始化 Http 请求相关（目前使用 Fetch 自行封装）
 * TODO: 这里存在一些不太合理的点
 * 1. 利用 axios 完全兼容 fetch 同时提供了更多可拓展的内容
 * 2. httpClient 应该放在模块内进行处理，而非以参数+ context 的形式进行存储。
 * @param appId AppId 用于 x-authing-app-id
 * @param tenantId tenantId 用于 x-authing-app-tenant-id
 * @param staticConfig 合并后的静态配置（用户传入+默认配置）
 * @param host 接受的host指向地址
 * @returns { httpClient } 请求实例
 */
export default function useHttp(
  appId?: string,
  tenantId?: string,
  staticConfig?: GuardLocalConfig,
  host?: string
) {
  const [httpClient, setHttpClient] = useState<GuardHttp>()

  useEffect(() => {
    if (!appId || !staticConfig) {
      return
    }

    const httpClient = initGuardHttp(staticConfig.host)
    httpClient.setAppId(appId)
    tenantId && httpClient.setTenantId(tenantId)
    setHttpClient(httpClient)
  }, [appId, tenantId, staticConfig])

  /**
   * 更新 BaseUrl
   */
  useEffect(() => {
    if (httpClient && host) {
      httpClient?.setBaseUrl(host)
    }
  }, [host, httpClient])

  return {
    httpClient,
  }
}
