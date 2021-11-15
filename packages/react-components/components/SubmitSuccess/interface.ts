import { IG2Config, IG2Events, IG2FCViewProps } from '../Type'

export interface SubmitSuccessEvents extends IG2Events {}

export interface SubmitSuccessConfig extends IG2Config {}

export interface SubmitSuccessInitData {
  title?: string
  message?: string
}

export interface GuardSubmitSuccessViewProps
  extends IG2FCViewProps,
    SubmitSuccessEvents {
  config: SubmitSuccessConfig
  initData?: SubmitSuccessInitData
}
