import { IG2Config, IG2Events, IG2FCProps, IG2FCViewProps } from '..'

export interface IdentityBindingConfig extends IG2Config {}

export interface IdentityBindingEvents extends IG2Events {}

export interface GuardIdentityBindingProps
  extends IG2FCProps,
    IdentityBindingEvents {
  config?: Partial<IdentityBindingConfig>
}

export interface GuardIdentityBindingViewProps
  extends GuardIdentityBindingProps,
    IG2FCViewProps {
  config: IdentityBindingConfig
}
