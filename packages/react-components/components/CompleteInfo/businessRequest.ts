import { getGuardAuthClient } from '../Guard/authClient'
import { getGuardHttp } from '../_utils/guardHttp'
import { CompleteInfoRequest } from './interface'

export enum CompleteInfoAuthFlowAction {
  Complete = 'complete-completion',
  Skip = 'skip-completion',
}

export const authFlow = async (
  action: CompleteInfoAuthFlowAction,
  data?: CompleteInfoRequest
) => {
  const { authFlow } = getGuardHttp()

  const res = await authFlow(action, data)

  return res
}

const registerMethod = (
  fnName: 'registerByEmail' | 'registerByPhoneCode',
  content: any,
  profile?: any
) => {
  const authClient = getGuardAuthClient()

  if (fnName === 'registerByEmail') {
    const phoneToken = profile.phoneToken

    delete profile.phoneToken

    return authClient!.registerByEmail(
      content.email,
      content.password,
      {
        ...content.profile,
        ...profile,
      },
      {
        ...content.options,
        phoneToken,
      }
    )
  } else if (fnName === 'registerByPhoneCode') {
    const emailToken = profile?.emailToken

    delete profile?.emailToken

    return authClient!.registerByPhoneCode(
      content.phone,
      content.code,
      content.password,
      {
        ...content.profile,
        ...profile,
      },
      {
        ...content.options,
        emailToken,
      }
    )
  }
}

export const registerRequest = async (
  action: CompleteInfoAuthFlowAction,
  registerFnName: 'registerByEmail' | 'registerByPhoneCode',
  registerContent: any,
  registerProfile?: any
) => {
  if (action === CompleteInfoAuthFlowAction.Skip) {
    return await registerMethod(registerFnName, registerContent)
  } else if (action === CompleteInfoAuthFlowAction.Complete) {
    return await registerMethod(
      registerFnName,
      registerContent,
      registerProfile
    )
  }
}
