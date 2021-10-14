import React from 'react'
import { IG2FCProps } from 'src/classes'

import './styles.less'

export interface GuardMFAProps extends IG2FCProps {
  // appId: string
  // config?: GuardConfig
}

export const GuardMFA = (props: GuardMFAProps) => {
  console.log('props', props.initData)
  return <div className="g2-mfa-container">mfa</div>
}
