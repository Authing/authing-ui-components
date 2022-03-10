import React from 'react'
import { createGlobalState } from 'react-use'
import { GuardProps } from '..'
import { ModuleState } from '../GuardModule/stateMachine'
import { RenderContext } from './renderContext'
import { RenderModule } from './renderModule'

const useAppId = createGlobalState()

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
