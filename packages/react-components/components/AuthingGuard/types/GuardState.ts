import { LoginMethods, RegisterMethods } from './GuardConfig'
import { GuardScenes } from './GuardConfig'

export interface ActiveTabs {
  [GuardScenes.Login]: LoginMethods
  [GuardScenes.Register]: RegisterMethods
}
