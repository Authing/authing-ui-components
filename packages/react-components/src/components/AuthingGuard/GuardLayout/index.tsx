import { Spin } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

import { insertStyles } from '@/utils'
import { useGuardContext } from '@/context/global/context'
import { GuardHeader } from '@/components/AuthingGuard/Header'
import { MfaLayout } from '@/components/AuthingGuard/MfaLayout'
import { LoginLayout } from '@/components/AuthingGuard/LoginLayout'
import { defaultGuardConfig } from '@/components/AuthingGuard/constants'
import { RegisterLayout } from '@/components/AuthingGuard/RegisterLayout'
import { ResetPwdLayout } from '@/components/AuthingGuard/ResetPwdLayout'
import {
  UserPoolConfig,
  fetchAppConfig,
  fetchUserPoolConfig,
  ApplicationConfig,
} from '@/components/AuthingGuard/api'
import {
  GuardScenes,
  GuardConfig,
  Protocol,
} from '@/components/AuthingGuard/types'

import './style.less'

const handleAppConfig = (appConfig?: Partial<ApplicationConfig>) => {
  //   插入自动义样式
  if (appConfig?.css) {
    insertStyles(appConfig?.css)
  }
}

const useGuardConfig = () => {
  const {
    state: { userPoolId, userConfig },
  } = useGuardContext()

  const [loadingUserPool, setLoadingUserPool] = useState(true)
  const [loadingApp, setLoadingApp] = useState(true)
  const [userPoolConfig, setUserPoolConfig] = useState<Partial<UserPoolConfig>>(
    {}
  )

  const [appConfig, setAppConfig] = useState<Partial<ApplicationConfig>>({})
  const [errorMsg, setErrorMsg] = useState('')
  const [errorDetail, setErrorDetail] = useState<any>()

  useEffect(() => {
    fetchUserPoolConfig(userPoolId)
      .then((res) => {
        if (res.code !== 200) {
          setErrorMsg(res.message!)
          setErrorDetail(res)
          return
        }
        setUserPoolConfig(res.data!)
      })
      .catch((e: any) => {
        setErrorMsg(JSON.stringify(e))
        setErrorDetail(e)
      })
      .finally(() => {
        setLoadingUserPool(false)
      })
  }, [userPoolId])

  useEffect(() => {
    if (!userConfig.appId) {
      setLoadingApp(false)
      return
    }
    fetchAppConfig(userConfig.appId)
      .then((res) => {
        if (res.code !== 200) {
          setErrorMsg(res.message!)
          setErrorDetail(res)
          return
        }
        setAppConfig(res.data!)
      })
      .catch((e: any) => {
        setErrorDetail(e)
        setErrorMsg(JSON.stringify(e))
      })
      .finally(() => {
        setLoadingApp(false)
      })
  }, [userConfig.appId])

  useEffect(() => {
    handleAppConfig(appConfig)
  }, [appConfig])

  const loading = useMemo(() => {
    return loadingApp || loadingUserPool
  }, [loadingUserPool, loadingApp])

  const guardConfig = useMemo<GuardConfig>(() => {
    /**
     * 将应用配置与用户手动传入的配置合并，手动传入的优先
     */

    // 社会化登录
    const socials =
      userConfig.socialConnections ||
      appConfig.socialConnections?.map?.((item) => item.provider) ||
      []
    const socialConnectionObjs = userPoolConfig.socialConnections?.filter?.(
      (item) => socials.includes(item.provider)
    )

    // 企业身份源
    const enterprises =
      userConfig.enterpriseConnections ||
      appConfig.identityProviders?.map?.((item) => item.identifier) ||
      []
    const enterpriseConnectionObjs = userPoolConfig.enterpriseConnections
      ?.filter?.((item) => enterprises.includes(item.identifier))
      //   OIDC 必须要有 appId
      .filter((item) => item.protocol !== Protocol.OIDC || userConfig.appId)

    // 登录方式
    const loginMethods =
      userConfig.loginMethods ||
      appConfig.loginTabs?.list ||
      defaultGuardConfig.loginMethods
    // 默认登录方式
    const defaultLoginMethod =
      userConfig.defaultLoginMethod ||
      appConfig.loginTabs?.default ||
      defaultGuardConfig.defaultLoginMethod

    // 注册方式
    const registerMethods =
      userConfig.registerMethods ||
      appConfig.registerTabs?.list ||
      defaultGuardConfig.registerMethods
    // 默认注册方式
    const defaultRegisterMethod =
      userConfig.defaultRegisterMethod ||
      appConfig.registerTabs?.default ||
      defaultGuardConfig.defaultRegisterMethod

    // 应用名
    const title = userConfig.title || appConfig.name || defaultGuardConfig.title
    // 应用 logo
    const logo = userConfig.logo || appConfig.logo || defaultGuardConfig.logo

    // 是否自动注册
    const autoRegister =
      userConfig.autoRegister ??
      appConfig.ssoPageComponentDisplay?.autoRegisterThenLoginHintInfo ??
      defaultGuardConfig.autoRegister

    return ({
      ...defaultGuardConfig,
      ...userConfig,
      logo,
      title,
      autoRegister,
      loginMethods,
      registerMethods,
      defaultLoginMethod,
      socialConnectionObjs,
      defaultRegisterMethod,
      enterpriseConnectionObjs,
    } as unknown) as GuardConfig
  }, [userConfig, userPoolConfig, appConfig])

  return {
    loading,
    errorMsg,
    guardConfig,
    errorDetail,
    userPoolConfig,
  }
}

export const GuardLayout = () => {
  const {
    state: { guardScenes, authClient, guardEvents },
    setValue,
  } = useGuardContext()

  const { loading, errorMsg, guardConfig, errorDetail } = useGuardConfig()

  useEffect(() => {
    if (loading) {
      return
    }
    if (errorDetail) {
      guardEvents.onLoadError?.(errorDetail)
      return
    }
    guardEvents.onLoad?.(authClient)
  }, [authClient, errorDetail, guardEvents, loading])

  useEffect(() => {
    setValue('config', guardConfig)
    setValue('activeTabs', {
      [GuardScenes.Login]: guardConfig.defaultLoginMethod,
      [GuardScenes.Register]: guardConfig.defaultRegisterMethod,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardConfig])

  const layoutMap = {
    [GuardScenes.Login]: <LoginLayout />,
    [GuardScenes.Register]: <RegisterLayout />,
    [GuardScenes.RestPassword]: <ResetPwdLayout />,
    [GuardScenes.MfaVerify]: <MfaLayout />,
  }
  return (
    <div className="authing-guard-layout">
      <div className="authing-guard-container">
        <GuardHeader />
        {loading ? (
          <Spin size="large" className="authing-guard-loading" />
        ) : errorMsg ? (
          <div className="authing-guard-load-error">{errorMsg}</div>
        ) : (
          layoutMap[guardScenes]
        )}
      </div>
    </div>
  )
}
