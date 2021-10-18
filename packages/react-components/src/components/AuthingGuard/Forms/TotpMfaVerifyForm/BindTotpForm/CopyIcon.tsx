import React, { FC, useState } from 'react'
import { CheckOutlined, CopyOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

export interface CopyIconProps {
  copyValue: string
  style?: React.CSSProperties
  className?: string
}
const CopyIcon: FC<CopyIconProps> = ({ copyValue, className, style }) => {
  const { t } = useTranslation()

  const [isCopy, setIsCopy] = useState(false)

  const onCopy = () => {
    setIsCopy(true)

    copyFunction(copyValue)

    setTimeout(() => {
      setIsCopy(false)
    }, 1000)
  }

  return !isCopy ? (
    <div className={className} style={style}>
      <CopyOutlined onClick={onCopy} />
    </div>
  ) : (
    <div className={className} style={style}>
      <Tooltip title={t('common.copyed')} visible={true}>
        <CheckOutlined style={{ color: '#52c41a' }} />
      </Tooltip>
    </div>
  )
}

export const copyFunction = (copyValue: string) => {
  let transfer = document.createElement('input')
  document.body.appendChild(transfer)
  transfer.value = copyValue
  transfer.focus()
  transfer.select()
  if (document.execCommand('copy')) {
    document.execCommand('copy')
  }
  transfer.blur()
  document.body.removeChild(transfer)
}

export default CopyIcon
