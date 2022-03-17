import { getGuardHttp } from '../_utils/guardHttp'

export enum ChangePasswordBusinessAction {
  ResetPassword = 'reset-password',
}

export const authFlow = async (
  action: ChangePasswordBusinessAction,
  content: {
    password: string
    oldPassword?: string
  }
) => {
  const { authFlow } = getGuardHttp()

  const res = await authFlow(action, { ...content })

  return res
}
