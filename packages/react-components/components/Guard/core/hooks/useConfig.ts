import { useEffect } from 'react'
import { insertStyles, removeStyles } from '../../../_utils'
import {
  useMergeDefaultConfig,
  useMergePublicConfig,
} from '../../../_utils/config'
import { GuardHttp } from '../../../_utils/guardHttp'
import { getDefaultGuardLocalConfig, GuardLocalConfig } from '../../config'

interface ConfigProps<T = any> {
  /**
   * 合并后的 appId
   */
  appId?: string
  /**
   * Http请求相关实例，后期可代替不使用props传递。直接利用 ESM import 即可
   */
  getHttpClient: () => GuardHttp | undefined
  /**
   *
   */
  setError: React.Dispatch<React.SetStateAction<T>>
  /**
   * 用户传入的配置
   */
  userConfig?: Partial<GuardLocalConfig>
}

/**
 * 初始化 Guard 配置
 * @param config 组件接受的 config props
 * @returns
 */
export default function useConfig(config: ConfigProps) {
  const { appId, userConfig, getHttpClient, setError } = config

  // Guard 默认配置
  const defaultConfig = getDefaultGuardLocalConfig()

  /**
   * 静态配置：组件传入+默认配置
   */
  const staticConfig = useMergeDefaultConfig(defaultConfig, userConfig)

  /**
   * 最终配置： 静态配置+ Server 返回配置
   * 依赖 httpClient 进行调用
   */
  const finallyConfig = useMergePublicConfig(
    appId,
    staticConfig,
    getHttpClient,
    setError
  )

  /**
   * 嵌入自定义 CSS
   */
  useEffect(() => {
    if (finallyConfig && finallyConfig.contentCss)
      insertStyles(finallyConfig.contentCss, 'appConfig')

    return () => removeStyles('appConfig')
  }, [finallyConfig])

  return {
    defaultMergedConfig: staticConfig,
    finallyConfig,
  }
}
