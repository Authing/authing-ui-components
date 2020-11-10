import { LoginMethods, RegisterMethods } from './GuardConfig'
import { GuardScenes } from '@/components/AuthingGuard/types/GuardConfig'

export interface ActiveTabs {
  [GuardScenes.Login]: LoginMethods
  [GuardScenes.Register]: RegisterMethods
}
