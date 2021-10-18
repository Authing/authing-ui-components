import { AuthenticationClient, CommonMessage } from 'authing-js-sdk'
import { Lang } from 'authing-js-sdk/build/main/types'
import { ApplicationConfig } from 'src/components/AuthingGuard/api'
import { GuardModuleType } from 'src/components/Guard/module'

export enum GuardMode {
  Modal = 'modal',
  Normal = 'normal',
}

export enum GuardScenes {
  Login = 'login',
  Register = 'register',
}

export interface IG2FCProps extends IG2Events {
  appId: string
  initData?: any
  config?: any
  // unrequestRemote?: boolean // 默认为 true
}

export interface IG2Config {
  userpool?: string
  title?: string
  logo?: string
  contentCss?: string
  lang?: Lang
  host?: string
  mode?: GuardMode
  target?: HTMLElement
  clickCloseable?: boolean
  escCloseable?: boolean
  __publicConfig__?: ApplicationConfig
}

export interface IG2Events {
  onLoad?: (authClient: AuthenticationClient) => void
  onLoadError?: (error: CommonMessage) => void
  onClose?: () => void
  // __codePaser?: (code: number) => Function
  __changeModule?: (moduleName: GuardModuleType, initData: any) => void
}

const defaultG2Config: IG2Config = {
  lang: 'zh-CN',
  title: 'Authing',
  escCloseable: true,
  clickCloseable: true,
  mode: GuardMode.Normal,
  host: 'https://core.authing.cn',
  logo:
    'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
}

export const getDefaultG2Config = (): IG2Config => defaultG2Config
