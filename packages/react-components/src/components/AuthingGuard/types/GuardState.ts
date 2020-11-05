import { LoginMethods, RegisterMethods } from './GuardConfig'
import { GuardScenes } from '@/components/AuthingGuard/types'

export interface ActiveTabs {
  [GuardScenes.Login]: LoginMethods
  [GuardScenes.Register]: RegisterMethods
}
