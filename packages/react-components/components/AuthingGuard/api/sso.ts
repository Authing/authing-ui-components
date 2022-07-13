import { User } from '../types'
import { requestClient } from '../../_utils/http'

export interface SessionData {
  session: null | {
    _id: string
    cookie: {
      originalMaxAge: number
      expires: Date
      secure: boolean
      httpOnly: boolean
      path: string
      sameSite: string
    }
    appId?: string
    type: string
    userId: string
  }
  userInfo?: User
}

export const trackSession = () =>
  requestClient.get<SessionData>(`/cas/session`, {})
