import { Tabs } from 'antd'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { IconFont } from '../IconFont'
import { LoginWithPassword } from '../Login/core/withPassword'
import { LoginWithVerifyCode } from '../Login/core/withVerifyCode'
import { i18n } from '../_utils/locales'
import { GuardIdentityBindingViewProps } from './interface'
import './styles.less'

export const GuardIdentityBindingView: React.FC<GuardIdentityBindingViewProps> = (
  props
) => {
  const { config } = props
  const { t } = useTranslation()
  const { publicKey, autoRegister, agreementEnabled } = config

  const onBack = () => {}

  const [, onBind] = useAsyncFn(async () => {}, [])

  const agreements = useMemo(
    () =>
      agreementEnabled
        ? config?.agreements?.filter(
            (agree) =>
              agree.lang === i18n.language &&
              (autoRegister || !!agree?.availableAt)
          ) ?? []
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreementEnabled, autoRegister, config?.agreements, i18n.language]
  )

  const methods = [
    {
      key: 'code',
      title: t('common.verifyCodeLogin'),
      component: (
        <LoginWithVerifyCode
          verifyCodeLength={props.config.__publicConfig__?.verifyCodeLength}
          autoRegister={autoRegister}
          onBeforeLogin={onBind}
          onLogin={() => {}}
          agreements={agreements}
        />
      ),
    },
    {
      key: 'password',
      title: t('login.pwdLogin'),
      component: (
        <LoginWithPassword
          publicKey={publicKey!}
          autoRegister={autoRegister}
          host={config.__appHost__}
          onBeforeLogin={onBind}
          passwordLoginMethods={[
            'username-password',
            'email-password',
            'phone-password',
          ]}
          onLogin={() => {}}
          agreements={agreements}
        />
      ),
    },
  ]

  return (
    <div className="g2-view-container g2-view-identity-binding">
      <div className="g2-view-back" style={{ display: 'inherit' }}>
        <span onClick={onBack} className="g2-view-mfa-back-hover">
          <IconFont type="authing-arrow-left-s-line" style={{ fontSize: 24 }} />
          <span>{t('common.back')}</span>
        </span>
      </div>

      <div className="g2-view-identity-binding-content">
        <div className="g2-view-identity-binding-content-logo">
          <img src={props.config?.logo} alt="" className="logo" />
        </div>
        <div className="g2-view-identity-binding-content-title">
          <span>{t('common.identityBindingTitle')}</span>
        </div>
        <div className="g2-view-identity-binding-content-desc">
          <span>{t('common.identityBindingDesc')}</span>
        </div>
        <div className="g2-view-identity-binding-content-login">
          <Tabs>
            {methods.map((method) => (
              <Tabs.TabPane key={method.key} tab={method.title}>
                {method.component}
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
