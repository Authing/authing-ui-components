import { AuthenticationClient } from 'authing-js-sdk'
import React from 'react'

export interface AuthClientContextProps {
  client: AuthenticationClient
}

export const AuthClientContext = React.createContext<
  AuthClientContextProps | undefined
>(undefined)
