import React from 'react'
import { GuardProps } from '..'
import { ModuleState } from '../GuardModule/stateMachine'
import { RenderContext } from './renderContext'
import { RenderModule } from './renderModule'

export const useRenderGuardCore = (
  props: GuardProps,
  initState: ModuleState
) => {
  return (
    <RenderContext guardProps={props} initState={initState}>
      <RenderModule guardProps={props} />
    </RenderContext>
  )
}
