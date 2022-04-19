import React, { useState } from 'react'
import { GuardProps } from '..'
import { ModuleState } from '../GuardModule/stateMachine'
import { RenderContext } from './renderContext'
import { RenderModule } from './renderModule'
import { useInitGuardAppendConfig } from './useAppendConfig'
import { useGuardPlugin } from './usePlugin'

export interface GuardCoreProps {
  guardProps: GuardProps
  initState: ModuleState
}

export const GuardCore = (props: GuardCoreProps) => {
  const { guardProps, initState } = props
  // 强制刷新
  const [forceUpdate, setForceUpdate] = useState(Date.now())

  useInitGuardAppendConfig(guardProps, setForceUpdate)

  useGuardPlugin(guardProps)

  return (
    <RenderContext
      guardProps={guardProps}
      forceUpdate={forceUpdate}
      initState={initState}
    >
      <RenderModule guardProps={guardProps} />
    </RenderContext>
  )
}
