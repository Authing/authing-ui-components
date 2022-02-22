import { Button } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { GuardModuleType, User } from '..'
import { useGuardAuthClient } from '../Guard/authClient'
import { IconFont } from '../IconFont'
import { useGuardHttp } from '../_utils/guradHttp'
import { GuardIdentityBindingAskViewProps } from './interface'
import './styles.less'

export const GuardIdentityBindingAskView: React.FC<GuardIdentityBindingAskViewProps> = (
  props
) => {
  const { __changeModule, onLogin, initData } = props
  const { t } = useTranslation()
  const { post } = useGuardHttp()
  const authClient = useGuardAuthClient()

  const onBack = () => {}

  const [createLoading, createAccount] = useAsyncFn(async () => {
    const url = '/interaction/federation/binding/register'

    const res = await post(url, {})

    if (res.code === 200) {
      const { data } = res
      onLogin?.(data.user as User, authClient)
    }
  }, [])

  const bindingAccount = () => {
    __changeModule?.(GuardModuleType.IDENTITY_BINDING, initData)
  }

  return (
    <div className="g2-view-container g2-view-identity-binding-ask">
      <div className="g2-view-back" style={{ display: 'inherit' }}>
        <span onClick={onBack} className="g2-view-mfa-back-hover">
          <IconFont type="authing-arrow-left-s-line" style={{ fontSize: 24 }} />
          <span>{t('common.back')}</span>
        </span>
      </div>

      <div className="g2-view-identity-binding-ask-content">
        <div className="g2-view-identity-binding-ask-content-title">
          <span>{t('common.identityBindingAskTitle')}</span>
        </div>
        <div className="g2-view-identity-binding-ask-content-desc">
          <span>{t('common.identityBindingAskDesc')}</span>
        </div>
        <div className="g2-view-identity-binding-ask-content-img">
          <IconFont type="authing-bind" />
        </div>
        <div className="g2-view-identity-binding-ask-content-button-group">
          <Button
            className="g2-view-identity-binding-ask-content-button g2-view-identity-binding-ask-content-button-create"
            loading={createLoading.loading}
            onClick={createAccount}
          >
            {t('common.identityBindingCreate')}
          </Button>
          <Button
            className=" g2-view-identity-binding-ask-content-button g2-view-identity-binding-ask-content-button-binding authing-g2-submit-button"
            onClick={bindingAccount}
            type="primary"
          >
            {t('common.identityBindingBinding')}
          </Button>
        </div>
      </div>
    </div>
  )
}
