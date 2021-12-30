import React from 'react'
import { GuardRegisterView } from '../Register'
import { GuardRegisterProps } from '../Register/interface'
import { SingleComponent } from './SingleComponent'

export const Register: React.FC<GuardRegisterProps> = (props) => {
  return SingleComponent<GuardRegisterProps>(props, GuardRegisterView)
}
