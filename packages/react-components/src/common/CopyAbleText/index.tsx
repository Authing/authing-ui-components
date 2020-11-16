import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import { copyToClipboard, getClassnames } from '../../utils'

import './style.less'

export interface CopyTextProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CopyAbleText: FC<CopyTextProps> = ({ children, className }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const timer = useRef(-1)

  const startTimer = useCallback(() => {
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = (setTimeout(
      () => setCopied(false),
      3000
    ) as unknown) as number
  }, [timer])

  useEffect(() => {
    return () => clearTimeout(timer.current)
  }, [])

  const handleCopy = () => {
    copyToClipboard(divRef.current!.innerText)
    startTimer()
  }

  return (
    <div
      className={getClassnames(['authing-copy-text', className])}
      ref={divRef}
    >
      {children}
      {copied ? (
        <CheckOutlined
          className="authing-data-tips authing-data-tips__top authing-guard-pointer authing-copy-text-icon authing-copy-text-icon__success"
          data-tips="已复制"
        />
      ) : (
        <CopyOutlined
          className="authing-data-tips authing-data-tips__top authing-guard-pointer authing-copy-text-icon"
          data-tips="复制"
          onClick={handleCopy}
        />
      )}
    </div>
  )
}
