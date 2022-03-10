import { AuthenticationClient, CommonMessage } from 'authing-js-sdk'
import { Lang } from 'authing-js-sdk/build/main/types'
import { GuardMode } from '../AuthingGuard/types/GuardConfig'
import { GuardModuleType } from '../Guard/module'
export interface IG2FCProps extends IG2Events {
  appId: string
  tenantId?: string
  config?: Partial<IG2Config>
  visible?: boolean
  initData?: any
}

export interface IG2FCViewProps extends IG2FCProps {
  config: IG2Config
}

export interface IG2Config {
  title?: string
  logo?: string
  lang: Lang
  langRange: Lang[]
  host: string
  isHost?: boolean
  mode: GuardMode
  clickCloseable: boolean
  escCloseable: boolean
  userpool?: string
  contentCss?: string
  target?: HTMLElement | string
  __internalRequest__?: boolean
  __singleComponent__?: boolean
  __isAuthFlow__?: boolean
}

const defaultG2Config: IG2Config = {
  lang: 'zh-CN',
  langRange: ['zh-CN', 'en-US'],
  escCloseable: true,
  clickCloseable: true,
  mode: GuardMode.Normal,
  host: 'https://core.authing.cn',
}

export interface IG2Events {
  onLoad?: (authClient: AuthenticationClient) => void
  onLoadError?: (error: CommonMessage) => void
  onClose?: () => void
  onLangChange?: (lang: Lang) => void
  // __codePaser?: (code: number) => Function
  __changeModule?: (moduleName: GuardModuleType, initData?: any) => void
}

export const getDefaultG2Config = (): IG2Config => defaultG2Config
