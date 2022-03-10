import { Button, message } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { GuardModuleType } from '..'
import { useGuardAuthClient } from '../Guard/authClient'
import { IconFont } from '../IconFont'
import { codeMap } from '../Login/codemap'
import { shoudGoToComplete } from '../_utils'
import { useGuardPublicConfig } from '../_utils/context'
import { useGuardHttp } from '../_utils/guardHttp'
import { GuardIdentityBindingAskViewProps } from './interface'
import './styles.less'

export const GuardIdentityBindingAskView: React.FC<GuardIdentityBindingAskViewProps> = (
  props
) => {
  const { __changeModule, initData } = props
  const { t } = useTranslation()
  const { post } = useGuardHttp()
  const authClient = useGuardAuthClient()

  const onBack = () => __changeModule?.(GuardModuleType.LOGIN)
  const publicConfig = useGuardPublicConfig()

  const __codePaser = (code: number) => {
    const action = codeMap[code]
    if (code === 200) {
      return (data: any) => {
        //   props.onCreate?.(data.user, authClient!) // 创建成功
        //   props.onLogin?.(data.user, authClient!) // 创建成功
        props.onCreate?.(data.user, authClient!) // 创建成功
        // if (shoudGoToComplete(data.user, 'login', publicConfig, true)) {
        //   __changeModule?.(GuardModuleType.COMPLETE_INFO, {
        //     context: 'login',
        //     user: data.user,
        //   })
        // } else {
        props.onLogin?.(data.user, authClient!) // 创建成功
        // }
      }
    }

    if (!action) {
      return (initData?: any) => {
        // initData?._message && message.error(initData?._message)
        console.error('未捕获 code', code)
      }
    }

    // 解析成功
    if (action?.action === 'changeModule') {
      let m = action.module ? action.module : GuardModuleType.ERROR
      let init = action.initData ? action.initData : {}
      return (initData?: any) => {
        props.__changeModule?.(m, { ...initData, ...init })
      }
    }
    if (action?.action === 'message') {
      return (initData?: any) => {
        message.error(initData?._message)
      }
    }
    if (action?.action === 'accountLock') {
      return () => {}
    }

    // 最终结果
    return (initData?: any) => {
      // props.onLoginError?.(data, client!) // 未捕获 code
      console.error('last action at loginview')
      message.error(initData?._message)
    }
  }

  const onCreate = (code: any, data: any, message?: string) => {
    const callback = __codePaser?.(code)
    if (code !== 200) {
      props.onCreateError?.({
        code,
        data,
        message,
      })
      props.onLoginError?.({
        code,
        data,
        message,
      })
    }
    if (!data) {
      data = {}
    }
    data._message = message
    callback?.(data)
  }

  const [createLoading, createAccount] = useAsyncFn(async () => {
    const url = '/interaction/federation/binding/register'

    const res = await post(url, {})

    onCreate(res.code, res.data, res.message)
  }, [])

  const bindingAccount = () => {
    __changeModule?.(GuardModuleType.IDENTITY_BINDING, {
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
