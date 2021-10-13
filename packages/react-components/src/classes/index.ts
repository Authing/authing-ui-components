import { Lang } from 'authing-js-sdk/build/main/types'

export enum GuardMode {
  Modal = 'modal',
  Normal = 'normal',
}

export enum GuardScenes {
  Login = 'login',
  Register = 'register',
}

export interface IG2FCProps {
  appId: string
  initData?: any
  config?: any
  // requestRemote: boolean // 默认为 true
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
