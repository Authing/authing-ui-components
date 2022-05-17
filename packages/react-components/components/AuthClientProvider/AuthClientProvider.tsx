import React, { useContext } from 'react'
import { AuthClientContext, AuthClientContextProps } from './context'

export const AuthClientProvider: React.FC<AuthClientContextProps> = (props) => {
  const { children, client } = props

  const Provider = AuthClientContext.Provider

  return <Provider value={{ client }}>{children}</Provider>
}

export const useGlobalAuthClient = () => {
  const authClientContext = useContext(AuthClientContext)

  return authClientContext?.client
}
