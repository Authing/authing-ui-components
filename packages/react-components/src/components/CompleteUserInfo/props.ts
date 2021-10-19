import {
  getDefaultG2Config,
  IG2Config,
  IG2Events,
  IG2FCProps,
} from 'src/classes'
import { ExtendsField } from '../AuthingGuard/api'

export interface CompleteUserInfoConfig extends IG2Config {
  extendsFields?: ExtendsField[]
}

const defaultConfig: CompleteUserInfoConfig = {
  ...getDefaultG2Config(),
}

const getDefaultConfig = (): CompleteUserInfoConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export const getDefaultCompleteUserInfoConfig = getDefaultConfig

export interface CompleteUserInfoEvents extends IG2Events {}

export interface CompleteUserInfoProps
  extends IG2FCProps,
    CompleteUserInfoEvents {
  config?: CompleteUserInfoConfig
}
