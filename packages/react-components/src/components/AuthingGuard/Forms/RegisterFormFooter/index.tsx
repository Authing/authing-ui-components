import { Button } from 'antd'
import React, { FC } from 'react'
import { useGuardContext } from '../../../context/global/context'
import { GuardScenes } from '../../../../components/AuthingGuard/types'

import './style.less'
import { useTranslation } from 'react-i18next'

export interface RegisterFormFooterProps {
  loading: boolean
}

export const RegisterFormFooter: FC<RegisterFormFooterProps> = ({
  loading,
}) => {
  const {
    setValue,
    state: { config },
  } = useGuardContext()
  const { t } = useTranslation()

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
              `map.${config.text?.registerBtn?.loading}`,
              config.text?.registerBtn?.loading
            )
          : t(
              `map.${config.text?.registerBtn?.normal}`,
              config.text?.registerBtn?.normal
            )}
      </Button>

      <div className="authing-guard-form-actions">
        <div className="authing-guard-tip-btn-comb">
          <span className="authing-guard-tip">{t('common.alreadyHasAcc')}</span>
          <Button
            onClick={() => setValue('guardScenes', GuardScenes.Login)}
            className="authing-guard-text-btn authing-guard-to-login-btn"
            type="text"
          >
            {t('common.loginImmediate')}
          </Button>
        </div>
      </div>
    </>
  )
}
