import React from 'react'
import { GuardProps } from '..'
import { ModuleState } from '../GuardModule/stateMachine'
import { RenderContext } from './renderContext'
import { RenderModule } from './renderModule'
import { useGuardPlugin } from './usePlugin'

export const useRenderGuardCore = (
  props: GuardProps,
  initState: ModuleState
) => {
  useGuardPlugin(props)

  return (
    <RenderContext guardProps={props} initState={initState}>
      <RenderModule guardProps={props} />
    </RenderContext>
  )
}
