import { message, Spin } from 'antd'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { getClassnames, insertStyles } from '../../../utils'
import { useGuardContext } from '../../../context/global/context'
import { GuardHeader } from '../../../components/AuthingGuard/Header'
import { MfaLayout } from '../../../components/AuthingGuard/MfaLayout'
import { LoginLayout } from '../../../components/AuthingGuard/LoginLayout'
import { defaultGuardConfig } from '../../../components/AuthingGuard/constants'
import { RegisterLayout } from '../../../components/AuthingGuard/RegisterLayout'
import { ResetPwdLayout } from '../../../components/AuthingGuard/ResetPwdLayout'
import {
  SessionData,
  trackSession,
  UserPoolConfig,
  fetchAppConfig,
  ApplicationConfig,
  fetchUserPoolConfig,
  SocialConnectionItem,
} from '../../../components/AuthingGuard/api'
import {
  GuardMode,
  GuardScenes,
  GuardConfig,
  UserConfig,
} from '../../../components/AuthingGuard/types'

import './style.less'

const checkConfig = (userPoolId: string, config: UserConfig) => {
  // 不要去掉 console.warn，不然 vue 版打包出来每次都会 throw error，估计是 rollup 打包有问题
  if (!userPoolId) {
    console.warn('用户池 ID: ', userPoolId)
    throw new Error('请传入用户池 ID')
  }
  if (config.isSSO && (!config.appDomain || !config.appId)) {
    console.warn('config 配置: ', config)
    throw new Error('SSO 模式请传入 appDomain 和 appId 字段')
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
    try {
      checkConfig(userPoolId, userConfig)

      setErrorDetail(null)
      setErrorMsg('')
    } catch (e: any) {
      setErrorDetail(e)
      setErrorMsg(e.message)
      console.error(e)
    }
  }, [userPoolId, userConfig])

  // 获取用户池配置
  useEffect(() => {
    setLoadingUserPool(true)

    if (!userPoolId) {
      setLoadingUserPool(false)
      return
    }

    fetchUserPoolConfig(userPoolId)
      .then((res) => {
        if (res.code !== 200) {
          setErrorMsg(res.message!)
          setErrorDetail(res)
          return
        }
        // 某些社会化登录会在 tabs 中显示，所以底部不显示了
        const hideSocials = ['wechat:miniprogram:qrconnect']
        if (res.data) {
          res.data.socialConnections = res.data?.socialConnections.filter(
            (item) => !hideSocials.includes(item.provider)
          )
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

  // 获取应用配置
  useEffect(() => {
    setLoadingApp(true)

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
    insertStyles(appConfig?.css)
    insertStyles(userConfig.contentCss)
  }, [appConfig, userConfig])

  const loading = useMemo(() => {
    return loadingApp || loadingUserPool
  }, [loadingUserPool, loadingApp])

  const guardConfig = useMemo<GuardConfig>(() => {
    /**
     * 将用户池配置、应用配置与用户手动传入的配置合并
     * 优先级：用户传入 > 应用 > 用户池
     */

    // 社会化登录
    let socialConnectionObjs: SocialConnectionItem[] | undefined
    // 默认展示所有社会化登录
    if (!userConfig.socialConnections && !appConfig.socialConnections) {
      socialConnectionObjs = [...(userPoolConfig.socialConnections || [])]
    } else {
      const socials =
        userConfig.socialConnections ||
        appConfig.socialConnections?.map?.((item) => item.provider) ||
        []
      socialConnectionObjs = userPoolConfig.socialConnections?.filter?.(
        (item) => socials.includes(item.provider)
      )
    }

    // 企业身份源
    let enterpriseConnectionObjs: ApplicationConfig['identityProviders']
    if (!userConfig.appId) {
      // 企业身份源都要绑定 AppId
      enterpriseConnectionObjs = []
    } else if (userConfig.enterpriseConnections) {
      enterpriseConnectionObjs =
        appConfig.identityProviders?.filter?.((item) =>
          userConfig.enterpriseConnections!.includes(item.identifier)
        ) || []
    } else {
      enterpriseConnectionObjs = appConfig.identityProviders || []
    }

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
    const title = loading
      ? ''
      : userConfig.title ??
        appConfig.name ??
        userPoolConfig.name ??
        defaultGuardConfig.title

    // 应用 logo
    const logo = loading
      ? ''
      : userConfig.logo ??
        appConfig.logo ??
        userPoolConfig.logo ??
        defaultGuardConfig.logo

    // 是否自动注册
    const autoRegister =
      userConfig.autoRegister ??
      appConfig.ssoPageComponentDisplay?.autoRegisterThenLoginHintInfo ??
      defaultGuardConfig.autoRegister

    // 禁止注册
    const disableRegister =
      userConfig.disableRegister ??
      !(
        appConfig.ssoPageComponentDisplay?.registerBtn ??
        !defaultGuardConfig.disableRegister
      )

    // 禁止重置密码
    const disableResetPwd =
      userConfig.disableResetPwd ??
      !(
        appConfig.ssoPageComponentDisplay?.registerBtn ??
        !defaultGuardConfig.disableResetPwd
      )

    return ({
      ...defaultGuardConfig,
      ...userConfig,
      logo,
      title,
      autoRegister,
      loginMethods,
      disableRegister,
      disableResetPwd,
      registerMethods,
      defaultLoginMethod,
      socialConnectionObjs,
      defaultRegisterMethod,
      enterpriseConnectionObjs,
    } as unknown) as GuardConfig
  }, [
    userConfig,
    appConfig.socialConnections,
    appConfig.loginTabs?.list,
    appConfig.loginTabs?.default,
    appConfig.registerTabs?.list,
    appConfig.registerTabs?.default,
    appConfig.name,
    appConfig.logo,
    appConfig.ssoPageComponentDisplay?.autoRegisterThenLoginHintInfo,
    appConfig.ssoPageComponentDisplay?.registerBtn,
    appConfig.identityProviders,
    loading,
    userPoolConfig.name,
    userPoolConfig.logo,
    userPoolConfig.socialConnections,
  ])

  return {
    loading,
    errorMsg,
    guardConfig,
    errorDetail,
    userPoolConfig,
  }
}

const useModal = (visible?: boolean) => {
  const {
    state: { userConfig },
  } = useGuardContext()

  const isModal = userConfig.mode === GuardMode.Modal
  // 传入了 visible 则为受控组件
  const isControlled = typeof visible !== 'undefined'

  // modal 模式，没传 visible，默认为 true
  const [localVisible, setLocalVisible] = useState(
    isModal && isControlled ? visible : true
  )

  const toggleLocalVisible = () => {
    setLocalVisible((v) => !v)
  }

  const realVisible = useMemo(() => {
    return isControlled ? visible : localVisible
  }, [isControlled, localVisible, visible])

  return {
    isModal,
    realVisible,
    isControlled,
    toggleLocalVisible,
  }
}

export const GuardLayout: FC<{
  visible?: boolean
  className?: string
  id?: string
}> = ({ visible, id, className }) => {
  const {
    state: { guardScenes, authClient, guardEvents },
    setValue,
  } = useGuardContext()

  const { realVisible, isControlled, toggleLocalVisible } = useModal(visible)

  const { loading, errorMsg, guardConfig, errorDetail } = useGuardConfig()

  // 动画完成后完全隐藏 dom
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    setHidden(false)
  }, [realVisible])

  const closeHandler = useCallback(() => {
    if (!isControlled) {
      toggleLocalVisible()
    }
    guardEvents.onClose?.()
  }, [isControlled, guardEvents, toggleLocalVisible])

  useEffect(() => {
    if (loading) {
      return
    }
    if (errorDetail) {
      guardEvents.onLoadError?.(errorDetail)
      return
    }

    guardEvents.onLoad?.(authClient)

    if (guardConfig.isSSO) {
      trackSession().then((sessionData) => {
        // 这个接口没有 code, data, 直接返回了数据
        let typedData = (sessionData as unknown) as SessionData
        if (typedData.userInfo) {
          message.success('登录成功')
          guardEvents.onLogin?.(typedData.userInfo, authClient)
        }
      })
    }
  }, [authClient, errorDetail, guardEvents, loading, guardConfig])

  useEffect(() => {
    setValue('config', guardConfig)
    setValue('activeTabs', {
      [GuardScenes.Login]: guardConfig.defaultLoginMethod,
      [GuardScenes.Register]: guardConfig.defaultRegisterMethod,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardConfig])

  const isModal = useMemo(() => guardConfig.mode === GuardMode.Modal, [
    guardConfig,
  ])

  // 监听 esc 关闭 modal
  useEffect(() => {
    const handler = (evt: KeyboardEvent) => {
      if (evt.keyCode === 27 && guardConfig.escCloseable) {
        closeHandler()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeHandler, guardConfig])

  const layoutMap = {
    [GuardScenes.Login]: <LoginLayout />,
    [GuardScenes.Register]: <RegisterLayout />,
    [GuardScenes.RestPassword]: <ResetPwdLayout />,
    [GuardScenes.MfaVerify]: <MfaLayout />,
  }

  return (
    <div
      id={id}
      className={getClassnames([
        'authing-guard-layout',
        !realVisible && 'authing-guard-layout__hidden',
        isModal && 'authing-guard-layout__modal',
        hidden && 'authing-guard-layout__dis-none',
        className,
      ])}
      onTransitionEnd={() => {
        if (!realVisible) {
          setHidden(true)
        }
      }}
    >
      <>
        {isModal && (
          <div
            className={getClassnames([
              'authing-guard-mask',
              !realVisible && 'authing-guard-mask__hidden',
            ])}
          ></div>
        )}
        <div
          className={getClassnames([
            'authing-guard-container',
            !realVisible && 'authing-guard-container__hidden',
          ])}
        >
          {isModal && guardConfig.clickCloseable && (
            <button onClick={closeHandler} className="authing-guard-close-btn">
              <i className="authing-icon authing-guanbi"></i>
            </button>
          )}

          <GuardHeader />

          {loading ? (
            <Spin size="large" className="authing-guard-loading" />
          ) : errorMsg ? (
            <div className="authing-guard-load-error">{errorMsg}</div>
          ) : (
            layoutMap[guardScenes]
          )}
        </div>
      </>
    </div>
  )
}
