import React, { ReactNode } from 'react'
import { FC } from 'react'
import './style.less'

export interface MobileStepProps {
  title: string
}

export interface MobileStepsProps {
  current: number
  data: ReactNode[]
}

const MobileSteps: FC<MobileStepsProps> = ({ current, data }) => {
  return (
    <div className="mobileSteps">
      <div>
        <span
          style={{
            color: '#396AFF',
            fontSize: 28,
          }}
        >
          {current + 1}
        </span>
        <span
          style={{
            color: '#9FABCB',
            fontSize: 18,
          }}
        >
          {' '}
          / {data.length}
        </span>
      </div>
      <div
        style={{
          fontSize: 14,
          color: '#293350',
          marginTop: 16,
        }}
      >
        {data[current]}
      </div>
    </div>
  )
}

export { MobileSteps }
