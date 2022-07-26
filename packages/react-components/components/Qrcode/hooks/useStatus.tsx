import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as SuccessIcon } from '../assets/checkbox-circle-fill.svg'
import { ReactComponent as ReferIcon } from '../assets/refer-qr-code.svg'
import { CodeStatus, prefix } from '../UiQrCode'

/**
 * 根据不同状态添加不同的元素
 * 维护不同状态的处理
 */
const useStatus = (status: CodeStatus) => {
  const classes = `${prefix}-qrcode--${status}`

  const { t } = useTranslation()

  /**
   * 不同状态的中间组件
   * TODO: 应该外部传入 具体看后续需求吧，如果有非统一状态外部覆盖
   * 否则保持内部统一模板无需改动
   */
  const componentMapping = useMemo(() => {
    const mapping: Record<CodeStatus, React.ReactNode> = {
      loading: null,
      ready: null,
      already: (
        <>
          <SuccessIcon style={{ width: '40px', height: '40px' }} />
          <span className={`${prefix}-inner__title--already`}>
            {t('login.scanSuccess')}
          </span>
        </>
      ),
      cancel: (
        <>
          <ReferIcon style={{ width: '40px', height: '40px' }} />
          <span className={`${prefix}-inner__title--refer`}>
            {t('login.qrcodeRefer')}
          </span>
        </>
      ),
      expired: (
        <>
          <ReferIcon style={{ width: '40px', height: '40px' }} />
          <span className={`${prefix}-inner__title--refer`}>
            {t('login.qrcodeRefer')}
          </span>
        </>
      ),
      error: (
        <>
          <ReferIcon style={{ width: '40px', height: '40px' }} />
          <span className={`${prefix}-inner__title--refer`}>
            {t('login.qrcodeNetWorkError')}
          </span>
        </>
      ),
      success: null,
      MFA: null,
    }
    return mapping[status]
  }, [status, t])

  return [classes, componentMapping]
}

export { useStatus }
