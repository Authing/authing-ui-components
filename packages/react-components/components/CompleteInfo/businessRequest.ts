import { getGuardHttp } from '../_utils/guardHttp'
import { CompleteInfoRequest } from './interface'

export enum CompleteInfoAuthFlowAction {
  Complete = 'complete',
  Skip = 'skip',
}

export const authFlow = async (
  action: CompleteInfoAuthFlowAction,
  data?: CompleteInfoRequest
) => {
  const { authFlow } = getGuardHttp()

  const res = await authFlow(action, data)

  return res
}
