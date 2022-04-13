import React from 'react'
import { GuardProps } from '..'
import { ModuleState } from '../GuardModule/stateMachine'
import { RenderContext } from './renderContext'
import { RenderModule } from './renderModule'
import { useInitGuardAppendConfig } from './useAppendConfig'
import { useGuardPlugin } from './usePlugin'

export const useRenderGuardCore = (
  props: GuardProps,
  initState: ModuleState
) => {
  useInitGuardAppendConfig(props)

  useGuardPlugin(props)

  return (
    <RenderContext guardProps={props} initState={initState}>
      <RenderModule guardProps={props} />
    </RenderContext>
  )
}
