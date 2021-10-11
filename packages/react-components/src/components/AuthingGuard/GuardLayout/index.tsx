import { message, Spin } from 'antd'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import {
  getClassnames,
  insertStyles,
  deepMerge,
  removeStyles,
} from '../../../utils'
import { useGuardContext } from '../../../context/global/context'
import { GuardHeader } from '../../../components/AuthingGuard/Header'
import { MfaLayout } from '../../../components/AuthingGuard/MfaLayout'
import { LoginLayout } from '../../../components/AuthingGuard/LoginLayout'
import {
  defaultGuardConfig,
  HIDE_SOCIALS,
} from '../../../components/AuthingGuard/constants'
import { RegisterLayout } from '../../../components/AuthingGuard/RegisterLayout'
import { ResetPwdLayout } from '../../../components/AuthingGuard/ResetPwdLayout'
import {
  SessionData,
  trackSession,
  fetchAppConfig,
  ApplicationConfig,
  SocialConnectionItem,
} from '../../../components/AuthingGuard/api'
import {
  GuardMode,
  GuardScenes,
  GuardConfig,
  UserConfig,
  Lang,
} from '../../../components/AuthingGuard/types'

import './style.less'
import { CompleteUserInfoLayout } from '../CompleteUserInfoLayout'
import { AppMfaLayout } from '../AppMFALayout'
import { IconFont } from '../IconFont'
import { ToggleLang } from '../ToggleLang'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { changeLang } from '../../../locales'

const checkConfig = (appId: string) => {
  // 不要去掉 console.warn，不然 vue 版打包出来每次都会 throw error，估计是 rollup 打包有问题
  if (!appId) {
    console.warn('APP ID: ', appId)
    throw new Error(i18n.t('common.unAppId'))
  }
}

const useGuardConfig = () => {
  const {
    state: { appId, userConfig },
    setValue,
  } = useGuardContext()

  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)

  const [appConfig, setAppConfig] = useState<Partial<ApplicationConfig>>({})
  const [errorMsg, setErrorMsg] = useState('')
  const [errorDetail, setErrorDetail] = useState<any>()

  useEffect(() => {
    try {
      checkConfig(appId)

      setErrorDetail(null)
      setErrorMsg('')
    } catch (e: any) {
      setErrorDetail(e)
      setErrorMsg(e.message)
      console.error(e)
    }
  }, [appId])

  // 获取应用配置
  useEffect(() => {
    setLoading(true)

    if (!appId) {
      setLoading(false)
      return
    }
    fetchAppConfig(appId)
      .then((res) => {
        if (res.code !== 200) {
          setErrorMsg(res.message!)
          setErrorDetail(res)
          return
        }

        setAppConfig(res.data!)
        setValue('userPoolId', res.data?.userPoolId)
      })
      .catch((e: any) => {
        setErrorDetail(e)
        setErrorMsg(t('common.networkError'))
      })
      .finally(() => {
        setLoading(false)
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId])

  useEffect(() => {
    // 先移除之前的
    removeStyles('appConfig')
    removeStyles('userConfig')

    insertStyles(appConfig?.css, 'appConfig')
    insertStyles(userConfig.contentCss, 'userConfig')
  }, [appConfig, userConfig.contentCss])

  const guardConfig = useMemo<GuardConfig>(() => {
    /**
     * 将用应用配置与用户手动传入的配置合并
     * 优先级：用户传入 > 应用 > 用户池
     */

    // 社会化登录
    let socialConnectionObjs: SocialConnectionItem[] | undefined
    // 默认展示所有社会化登录
    if (!userConfig.socialConnections) {
      socialConnectionObjs = [...(appConfig.socialConnections || [])]
    } else {
      const socials = userConfig.socialConnections
      socialConnectionObjs = appConfig.socialConnections?.filter?.((item) =>
        socials.includes(item.provider)
      )
    }

    // 某些社会化登录会在 tabs 中显示，或者无法在 Guard 中使用，所以底部不显示了
    socialConnectionObjs = socialConnectionObjs?.filter(
      (item) => !HIDE_SOCIALS.includes(item.provider)
    )

    // 企业身份源
    let enterpriseConnectionObjs: ApplicationConfig['identityProviders']

    if (userConfig.enterpriseConnections) {
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

    // 账密登录的登录拆分
    const passwordLoginMethods =
      userConfig.passwordLoginMethods ||
      appConfig.passwordTabConfig?.enabledLoginMethods ||
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
      : userConfig.title ?? appConfig.name ?? defaultGuardConfig.title

    // 应用 logo
    const logo = loading
      ? ''
      : userConfig.logo ?? appConfig.logo ?? defaultGuardConfig.logo

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

    return deepMerge<GuardConfig>(
      {} as GuardConfig,
      defaultGuardConfig,
      userConfig,
      {
        logo,
        title,
        autoRegister,
        loginMethods,
        passwordLoginMethods,
        extendsFields: appConfig.extendsFields,
        disableRegister,
        disableResetPwd,
        registerMethods,
        defaultLoginMethod,
        socialConnectionObjs,
        defaultRegisterMethod,
        enterpriseConnectionObjs,
        publicKey: appConfig.publicKey,
        agreementEnabled: appConfig.agreementEnabled,
        agreements: appConfig.agreements,
      }
    )
  }, [
    userConfig,
    appConfig.loginTabs?.list,
    appConfig.loginTabs?.default,
    appConfig.passwordTabConfig?.enabledLoginMethods,
    appConfig.registerTabs?.list,
    appConfig.registerTabs?.default,
    appConfig.name,
    appConfig.logo,
    appConfig.ssoPageComponentDisplay?.autoRegisterThenLoginHintInfo,
    appConfig.ssoPageComponentDisplay?.registerBtn,
    appConfig.extendsFields,
    appConfig.publicKey,
    appConfig.agreementEnabled,
    appConfig.agreements,
    appConfig.socialConnections,
    appConfig.identityProviders,
    loading,
  ])

  return {
    loading,
    errorMsg,
    guardConfig,
    errorDetail,
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
  style?: React.CSSProperties
  lang?: Lang
  // 这个传下是为了响应 config 变化，好蠢，以后优化
  userConfig: UserConfig
}> = ({
  visible,
  id,
  className,
  style,
  lang,
  userConfig: reactiveUserConfig,
}) => {
  const { t } = useTranslation()
  const {
    state: { guardScenes, authClient, guardEvents, activeTabs, localesConfig },
    setValue,
  } = useGuardContext()

  const { realVisible, isControlled, toggleLocalVisible } = useModal(visible)

  const { loading, errorMsg, guardConfig, errorDetail } = useGuardConfig()

  useEffect(() => {
    if (lang) {
      authClient.setLang(lang)
      changeLang(lang)
    }
  }, [authClient, lang])

  useEffect(() => {
    if (!loading) {
      guardEvents.onLoginTabChange?.(activeTabs.login)
    }
  }, [activeTabs.login, loading, guardEvents])

  useEffect(() => {
    if (!loading) {
      guardEvents.onRegisterTabChange?.(activeTabs.register)
    }
  }, [activeTabs.register, loading, guardEvents])

  useEffect(() => {
    setValue('userConfig', reactiveUserConfig)
  }, [reactiveUserConfig, setValue])

  // 动画完成后完全隐藏 dom
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    setHidden(false)
  }, [realVisible])

  const closeHandler = useCallback(() => {
    if (!isControlled && realVisible) {
      toggleLocalVisible()
    }
    guardEvents.onClose?.()
  }, [isControlled, guardEvents, toggleLocalVisible, realVisible])

  useEffect(() => {
    if (loading) {
      return
    }
    if (errorDetail) {
      guardEvents.onLoadError?.(errorDetail)
      return
    }

    guardEvents.onLoad?.(authClient)
  }, [authClient, errorDetail, guardEvents, loading, t])

  useEffect(() => {
    if (guardConfig.isSSO) {
      trackSession().then((sessionData) => {
        // 这个接口没有 code, data, 直接返回了数据
        let typedData = (sessionData as unknown) as SessionData
        if (typedData.userInfo) {
          message.success(t('common.LoginSuccess'))
          guardEvents.onLogin?.(typedData.userInfo, authClient)
        }
      })
    }
  }, [guardConfig.isSSO, guardEvents, authClient, t])

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
      if (evt.keyCode === 27 && isModal && guardConfig.escCloseable) {
        closeHandler()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeHandler, guardConfig, isModal])

  const layoutMap = {
    [GuardScenes.Login]: <LoginLayout />,
    [GuardScenes.Register]: <RegisterLayout />,
    [GuardScenes.RestPassword]: <ResetPwdLayout />,
    [GuardScenes.MfaVerify]: <MfaLayout />,
    [GuardScenes.CompleteUserInfo]: <CompleteUserInfoLayout />,
    [GuardScenes.AppMfaVerify]: <AppMfaLayout />,
  }

  return (
    <div
      id={id}
      style={{
        ...style,
        zIndex: guardConfig.zIndex || 100,
      }}
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
              <IconFont type="authing-guanbi" />
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
          {/* <div>{localesConfig?.isShowChange && <ToggleLang />}</div> */}
          <div>
            {localesConfig?.isShowChange === false ? null : <ToggleLang />}
          </div>
        </div>
      </>
    </div>
  )
}
