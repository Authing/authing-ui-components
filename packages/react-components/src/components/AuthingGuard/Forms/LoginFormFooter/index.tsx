import { Button } from 'antd'
import React, { FC } from 'react'
import { useGuardContext } from '../../../../context/global/context'
import { GuardScenes } from '../../../../components/AuthingGuard/types'

import './style.less'
import { useTranslation } from 'react-i18next'

export interface LoginFormFooterProps {
  loading: boolean
  needRestPwd?: boolean
  needRegister?: boolean
}

export const LoginFormFooter: FC<LoginFormFooterProps> = ({
  loading,
  needRestPwd = false,
  needRegister = false,
}) => {
  const { t } = useTranslation()

  const {
    setValue,
    state: { config },
  } = useGuardContext()

  return (
    <>
      <Button
        htmlType="submit"
        size="large"
        type="primary"
        loading={loading}
        block
      >
        {loading
          ? t(
              `map.${config.text?.loginBtn?.loading}`,
              config.text?.loginBtn?.loading
            )
          : t(
              `map.${config.text?.loginBtn?.normal}`,
              config.text?.loginBtn?.normal
            )}
      </Button>

      <div className="authing-guard-form-actions">
        {needRestPwd && !config.disableResetPwd && (
          <Button
            onClick={() => setValue('guardScenes', GuardScenes.RestPassword)}
            className="authing-guard-text-btn"
            type="text"
          >
            {t('common.hasForgotPwd')}
          </Button>
        )}
        {needRegister && !config.disableRegister && (
          <div className="authing-guard-tip-btn-comb">
            <span className="authing-guard-tip">{t('common.noAccYet')}</span>
            <Button
              onClick={() => setValue('guardScenes', GuardScenes.Register)}
              className="authing-guard-text-btn"
              type="text"
            >
              {t('common.registerImmediate')}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
