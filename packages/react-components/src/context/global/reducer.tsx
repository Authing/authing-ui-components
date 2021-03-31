import {
  GuardConfig,
  ActiveTabs,
  GuardScenes,
  UserConfig,
  GuardEventsHandler,
  LocalesConfig,
} from '../../components/AuthingGuard/types'
import { AuthenticationClient } from 'authing-js-sdk'
import { IBaseAction } from '../base'
import { ApplicationMfaType } from '../../components/AuthingGuard/api/appConfig'

export type IState = {
  config: GuardConfig // 处理后的 Guard 配置
  userConfig: UserConfig // 用户传入的配置
  authClient: AuthenticationClient
  activeTabs: ActiveTabs // 登录、注册方式
  guardScenes: GuardScenes // 当前在哪个界面
  guardTitle: string
  // 需要 mfa 登录时后端返回的错误信息
  mfaData: {
    mfaToken: string
    phone?: string
    email?: string
    applicationMfa?: {
      status: 0 | 1
      mfaPolicy: ApplicationMfaType
      sort: number
    }[]
  }
  userPoolId: string
  appId: string
  guardEvents: GuardEventsHandler
  localesConfig: LocalesConfig
}

const handlers: any = {
  // eslint-disable-next-line
  ['SET_VALUE']: (state: IState, payloads: any) => {
    return {
      ...state,
      [payloads.key]: payloads.value,
    }
  },
}

export const reducer = (state: IState, { type, ...payloads }: IBaseAction) => {
  const handler = handlers[type]
  if (handler) {
    return handler(state, payloads)
  }
  return state
}
