import { GuardModuleType } from '../../Guard'

export enum CodeAction {
  // 切换 Module
  CHANGE_MODULE = 'changeModule',
  // 渲染 错误信息
  RENDER_MESSAGE = 'renderMessage',
}

export enum ApiCode {
  IDENTITY_BINDING_ASK = '1641',

  IDENTITY_BINDING = '1640',
}

export const ChangeModuleApiCodeMapping: Record<string, GuardModuleType> = {
  [ApiCode.IDENTITY_BINDING]: GuardModuleType.IDENTITY_BINDING,
  [ApiCode.IDENTITY_BINDING_ASK]: GuardModuleType.IDENTITY_BINDING_ASK,
}
