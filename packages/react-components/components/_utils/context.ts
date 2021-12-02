import React, { useContext } from 'react'
import { ApplicationConfig } from '../AuthingGuard/api'

const Context = React.createContext<ApplicationConfig | undefined>(undefined)
const Provider = Context.Provider
const Consumer = Context.Consumer

export const createGuardContext = () => ({
  Context,
  Provider,
  Consumer,
})

export const usePublicConfig = () => useContext(Context)
