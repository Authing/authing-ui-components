import React, { useMemo } from 'react'
import { ReactComponent as SuccessIcon } from '../assets/checkbox-circle-fill.svg'
import { CodeStatus, prefix } from '../UiQrCode'

/**
 * 根据不同状态添加不同的元素
 * 维护不同状态的处理
 */
const useStatus = (status: CodeStatus) => {
  const classes = `${prefix}-qrcode--${status}`

  /**
   * 不同状态的中间组件
   */
  const componentMapping = useMemo(() => {
    const mapping: Record<CodeStatus, React.ReactNode> = {
      loading: null,
      ready: null,
      already: <SuccessIcon />,
      cancel: <span>用户取消了登录</span>,
      expired: <span>糟糕，过期了</span>,
      error: <span>扫码失败</span>,
      success: <span>扫码成功</span>,
      MFA: <span>扫码成功</span>,
    }
    return mapping[status]
  }, [status])

  return [classes, componentMapping]
}

export { useStatus }
