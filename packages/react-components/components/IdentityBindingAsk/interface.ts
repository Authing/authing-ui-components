import { AuthenticationClient, User } from '..'
import { IG2Config, IG2Events, IG2FCProps, IG2FCViewProps } from '..'

export interface IdentityBindingAskConfig extends IG2Config {}

export interface IdentityBindingAskEvents extends IG2Events {
  onLogin?: (user: User, authClient: AuthenticationClient) => void
}

export interface GuardIdentityBindingAskProps
  extends IG2FCProps,
    IdentityBindingAskEvents {
  config?: Partial<IdentityBindingAskConfig>
  initData?: any
}

export interface GuardIdentityBindingAskViewProps
  extends GuardIdentityBindingAskProps,
    IG2FCViewProps {
  config: IdentityBindingAskConfig
  initData?: any
}
