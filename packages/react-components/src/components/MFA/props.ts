import {
  getDefaultG2Config,
  IG2Config,
  IG2Events,
  IG2FCProps,
} from 'src/classes'

export interface MFAConfig extends IG2Config {}

const defaultConfig: MFAConfig = {
  ...getDefaultG2Config(),
}

export const getDefaultLoginConfig = (): MFAConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export interface MFAEvents extends IG2Events {}

export enum MFAType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  TOTP = 'OTP',
  FACE = 'FACE',
}

export interface GuardMFAInitData {
  mfaToken: string
  applicationMfa: {
    mfaPolicy: MFAType
    sort: number
    status: 0 | 1
  }[]
  faceMfaEnabled: boolean
  totpMfaEnabled: boolean
  email?: string
  phone?: string
  avatar?: string
  nickme?: string
  username?: string
}

export interface GuardMFAProps extends IG2FCProps, MFAEvents {
  config: Partial<MFAConfig>
  initData: GuardMFAInitData
}

export interface GuardMFAViewProps extends GuardMFAProps {
  config: MFAConfig
  initData: GuardMFAInitData
}