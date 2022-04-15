import { memo, useEffect, useRef } from 'react'

import { GuardEvents } from './event'
import { IG2FCProps } from '../Type'
import { GuardLocalConfig } from './config'
import { GuardModuleType } from './module'
import 'moment/locale/zh-cn'
import { GuardCore } from './core/index'
import { getDocumentNode, GuardPropsFilter } from '../_utils'
import React from 'react'
import { initGuardDocument } from '../_utils/guardDocument'

export interface GuardProps extends GuardEvents, IG2FCProps {
  config?: Partial<GuardLocalConfig>
}

interface ModuleState {
  moduleName: GuardModuleType
  initData: any
}

const propsAreEqual = (pre: GuardProps, current: GuardProps) => {
  return GuardPropsFilter(pre, current)
}

export const Guard = memo((props: GuardProps) => {
  const { config } = props

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref?.current) return

    const guardDocument = getDocumentNode(ref.current)

    initGuardDocument(guardDocument)
  }, [])

  // 首页 init 数据
  const initState: ModuleState = {
    moduleName: config?.defaultScenes ?? GuardModuleType.LOGIN,
    initData: config?.defaultInitData ?? {},
  }

  return (
    <div ref={ref}>
      <GuardCore guardProps={props} initState={initState} />
    </div>
  )
}, propsAreEqual)
