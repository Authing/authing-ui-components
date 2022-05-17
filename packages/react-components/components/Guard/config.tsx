import React from 'react'
import { ReactNode } from 'react'
import { GuardModuleType } from '.'
import { getDefaultLoginConfig, LoginConfig } from '../Login/interface'
import { getDefaultRegisterConfig, RegisterConfig } from '../Register/interface'
import { ShieldSpin } from '../ShieldSpin'

export interface GuardComponentConfig extends Partial<GuardLocalConfig> {}

export enum QrCodeScanType {
  appQrcode = 'appQrcode',
  wechatMiniQrcode = 'wechatMiniQrcode',
  wechatmpQrcode = 'wechatmpQrcode',
}
export interface QrCodeScanOptions {
  qrcode: string
}

export interface GuardLocalConfig extends RegisterConfig, LoginConfig {
  isSSO?: boolean
  defaultScenes?: GuardModuleType
  defaultInitData?: any
  showLoading?: boolean
  loadingComponent?: ReactNode
  /**
   * @description 是否调用 eventsMapping 中的事件
   */
  openEventsMapping?: boolean
  _qrCodeScanOptions?: Record<QrCodeScanType, QrCodeScanOptions>
}

let defaultConfig: GuardLocalConfig = {
  ...getDefaultLoginConfig(),
  ...getDefaultRegisterConfig(),
  isSSO: false,
  defaultInitData: {},
  showLoading: true,
  openEventsMapping: true,
  loadingComponent: (
    <div className="g2-init-setting-loading">
      <ShieldSpin size={100} />
    </div>
  ),
}

export const getDefaultGuardLocalConfig = (): GuardLocalConfig => {
  return defaultConfig
}
