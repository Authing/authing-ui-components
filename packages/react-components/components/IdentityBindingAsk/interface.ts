import { IG2Config, IG2Events, IG2FCProps, IG2FCViewProps } from '..'

export interface IdentityBindingAskConfig extends IG2Config {}

export interface IdentityBindingAskEvents extends IG2Events {}

export interface GuardIdentityBindingAskProps
  extends IG2FCProps,
    IdentityBindingAskEvents {
  config?: Partial<IdentityBindingAskConfig>
}

export interface GuardIdentityBindingAskViewProps
  extends GuardIdentityBindingAskProps,
    IG2FCViewProps {
  config: IdentityBindingAskConfig
}
