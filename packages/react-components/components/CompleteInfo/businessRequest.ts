import { User } from 'authing-js-sdk'
import { getGuardAuthClient } from '../Guard/authClient'
import { getGuardHttp } from '../_utils/guardHttp'
import { CompleteInfoRequest, RegisterCompleteInfoInitData } from './interface'

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
  fnName: RegisterCompleteInfoInitData['businessRequestName'],
  content: any,
  profile: any
) => {
  const authClient = getGuardAuthClient()

  const { post } = getGuardHttp()

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
  } else if (fnName === 'registerByEmailCode') {
    const phoneToken = profile.phoneToken

    delete profile.phoneToken
    return post('/api/v2/register/email-code', {
      email: content.email,
      code: content.code,
      profile: {
        ...content.profile,
        ...profile,
      },
      ...content.options,
      context: JSON.stringify(content.options.context),
      phoneToken,
    }) as Promise<User>
  }
}

export const registerSkipMethod = (
  fnName: RegisterCompleteInfoInitData['businessRequestName'],
  content: any
) => {
  const authClient = getGuardAuthClient()
  const { post } = getGuardHttp()

  if (fnName === 'registerByEmail') {
    return authClient!.registerByEmail(
      content.email,
      content.password,
      {
        ...content.profile,
      },
      {
        ...content.options,
      }
    )
  } else if (fnName === 'registerByPhoneCode') {
    return authClient!.registerByPhoneCode(
      content.phone,
      content.code,
      content.password,
      {
        ...content.profile,
      },
      {
        ...content.options,
      }
    )
  } else if (fnName === 'registerByEmailCode') {
    return post('/api/v2/register/email-code', {
      email: content.email,
      code: content.code,
      profile: {
        ...content.profile,
      },
      ...content.options,
      context: JSON.stringify(content.options.context),
    }) as Promise<User>
  }
}

export const registerRequest = async (
  action: CompleteInfoAuthFlowAction,
  registerFnName: RegisterCompleteInfoInitData['businessRequestName'],
  registerContent: any,
  registerProfile?: any
) => {
  if (action === CompleteInfoAuthFlowAction.Skip) {
    return await registerSkipMethod(registerFnName, registerContent)
  } else if (action === CompleteInfoAuthFlowAction.Complete) {
    return await registerMethod(
      registerFnName,
      registerContent,
      registerProfile
    )
  }
}
