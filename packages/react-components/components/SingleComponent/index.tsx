import React from 'react'
import { GuardModuleType } from '..'
import { GuardRegisterProps } from '../Register/interface'
import { SingleComponent } from './SingleComponent'

export const Register: React.FC<GuardRegisterProps> = (props) => {
  const { config } = props
  return SingleComponent<GuardRegisterProps>(
    {
      ...props,
      config: {
        ...config,
        __singleComponent__: true,
        __unAuthFlow__: true,
      },
    },
    GuardModuleType.REGISTER
  )
}
