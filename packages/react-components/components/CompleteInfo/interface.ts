import { AuthenticationClient, CommonMessage, User } from 'authing-js-sdk'
import { getDefaultG2Config, IG2Config, IG2Events, IG2FCProps } from '../Type'

export interface CompleteInfoConfig extends IG2Config {}

const defaultConfig: CompleteInfoConfig = {
  ...getDefaultG2Config(),
}

export const getDefaultCompleteInfoConfig = (): CompleteInfoConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export interface CompleteInfoEvents extends IG2Events {
  onRegisterInfoCompleted?: (
    user: User,
    udfs: {
      definition: any
      value: any
    }[],
    authClient: AuthenticationClient
  ) => void
  onRegisterInfoCompletedError?: (
    error: CommonMessage,
    udfs: {
      definition: any
      value: any
    }[],
    authClient: AuthenticationClient
  ) => void
}

export interface GuardCompleteInfoProps extends IG2FCProps, CompleteInfoEvents {
  config: Partial<CompleteInfoConfig>
}

export interface GuardCompleteInfoViewProps extends GuardCompleteInfoProps {
  config: CompleteInfoConfig
  initData: any
  onLogin?: any
}

export type ExtendsFieldType = 'user' | 'internal'
export interface ExtendsField {
  type: ExtendsFieldType
  name: string
  label: string
  inputType: string
  required: boolean
  validateRules: any[]
}

export interface CompleteInfoRule {
  type: 'regExp' | 'isNumber'
  content: string
  errorMessages: string
}

export interface CompleteInfoSelectOption {
  value: string
  label: string
}

export interface CompleteInfoMetaData {
  type: CompleteInfoInputType
  label: string
  name: string
  required: boolean
  validateRules: CompleteInfoRule[]
  options?: CompleteInfoSelectOption[]
  order: number
}

export enum CompleteInfoInputType {
  IMAGE = 'image',
  NUMBER = 'number',
  DATE = 'date',
  DATE_TIME = 'dateTime',
  SELECT = 'select',
  DROPDOWN = 'dropdown',
  BOOLEAN = 'boolean',
  STRING = 'string',
  TEXT = 'text',
  GENDER = 'gender',
  COUNTRY = 'country',
  USERNAME = 'username',
  PHONE = 'phone',
  EMAIL = 'email',
}

export interface CompleteInfoInitData {
  skip: boolean
  metaData: CompleteInfoMetaData
}
