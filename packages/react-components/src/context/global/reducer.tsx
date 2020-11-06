import {
  ProcessedGuardConfig,
  ActiveTabs,
  GuardScenes,
  GuardConfig,
} from '@/components/AuthingGuard/types'
import { AuthenticationClient } from 'authing-js-sdk'
import { IBaseAction } from '../base'

export type IState = {
  config: ProcessedGuardConfig // 处理后的 Guard 配置
  userConfig: GuardConfig // 用户传入的配置
  authClient: AuthenticationClient
  activeTabs: ActiveTabs // 登录、注册方式
  guardScenes: GuardScenes // 当前在哪个界面
  guardTitle: string
  mfaToken: string // 需要 mfa 登录时返回的 token
  userPoolId: string
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
