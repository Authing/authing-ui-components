import { Button } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { GuardModuleType } from '..'
import { useGuardAuthClient } from '../Guard/authClient'
import { IconFont } from '../IconFont'
import {
  useGuardEvents,
  useGuardInitData,
  useGuardModule,
} from '../_utils/context'
import { useGuardHttp } from '../_utils/guardHttp'
import { GuardIdentityBindingAskInitData } from './interface'
import './styles.less'

export const GuardIdentityBindingAskView: React.FC = () => {
  const initData = useGuardInitData<GuardIdentityBindingAskInitData>()

  const { changeModule } = useGuardModule()

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const authClient = useGuardAuthClient()

  const onBack = () => changeModule?.(GuardModuleType.LOGIN)

  const events = useGuardEvents()

  const onCreate = (data: any) => {
    events?.onLogin?.(data, authClient)

    events?.onCreate?.(data, authClient)
  }

  const onCreateError = (code: any, data: any) => {
    events?.onCreateError?.({
      code,
      data,
    })
    events?.onLoginError?.({
      code,
      data,
    })
  }

  const [createLoading, createAccount] = useAsyncFn(async () => {
    const url = '/interaction/federation/binding/register'

    const { code, onGuardHandling, data } = await post(url, {})

    if (code === 200) {
      onCreate(data)
    } else {
      onCreateError(code, data)

      onGuardHandling?.()
    }
  }, [])

  const bindingAccount = () => {
    changeModule?.(GuardModuleType.IDENTITY_BINDING, {
      ...initData,
      source: GuardModuleType.IDENTITY_BINDING_ASK,
    })
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
