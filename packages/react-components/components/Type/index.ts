import { AuthenticationClient, CommonMessage } from 'authing-js-sdk'
import { Lang } from 'authing-js-sdk/build/main/types'
import { ApplicationConfig } from '../AuthingGuard/api'
import { GuardMode } from '../AuthingGuard/types/GuardConfig'
import { GuardModuleType } from '../Guard/module'
export interface IG2FCProps extends IG2Events {
  appId: string
  config?: Partial<IG2Config>
}

export interface IG2FCViewProps extends IG2FCProps {
  config: IG2Config
}

export interface IG2Config {
  title: string
  logo: string
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
  __appHost__?: string
  __publicConfig__?: ApplicationConfig
  __internalRequest__?: boolean
}

const defaultG2Config: IG2Config = {
  lang: 'zh-CN',
  langRange: ['zh-CN', 'en-US'],
  title: 'Authing',
  escCloseable: true,
  clickCloseable: true,
  mode: GuardMode.Normal,
  host: 'https://core.authing.cn',
  logo:
    'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
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

export const LanguageMap: any = {
  'en-US': 'US',
  en: 'GB',
  'en-GB': 'GB',
  ja: 'JP',
  'de-DE': 'DE',
  'zh-CN': 'CN',
}

export enum InputMethod {
  EmailCode = 'email-code',
  PhoneCode = 'phone-code',
}

export enum GuardPageSene {
  Global = 'guardGlobal',
}

export interface GuardPageConfig {
  [GuardPageSene.Global]: {
    showChangeLanguage: boolean
  }
}
