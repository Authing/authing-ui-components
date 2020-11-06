import { Spin } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

import { useGuardContext } from '@/context/global/context'
import { GuardHeader } from '@/components/AuthingGuard/Header'
import { MfaLayout } from '@/components/AuthingGuard/MfaLayout'
import { LoginLayout } from '@/components/AuthingGuard/LoginLayout'
import { RegisterLayout } from '@/components/AuthingGuard/RegisterLayout'
import { ResetPwdLayout } from '@/components/AuthingGuard/ResetPwdLayout'
import {
  fetchUserPoolConfig,
  UserPoolConfig,
} from '@/components/AuthingGuard/api'
import {
  GuardScenes,
  ProcessedGuardConfig,
  Protocol,
} from '@/components/AuthingGuard/types'

import './style.less'

const useProcessConfig = () => {
  const {
    state: { userPoolId, userConfig },
  } = useGuardContext()

  const [loading, setLoading] = useState(true)
  const [userPoolConfig, setUserPoolConfig] = useState<UserPoolConfig>({
    enterpriseConnections: [],
    socialConnections: [],
  })
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchUserPoolConfig(userPoolId)
      .then((res) => {
        if (res.code !== 200) {
          setErrorMsg(res.message!)
          return
        } else if (res.code === 200) {
          setUserPoolConfig(res.data!)
        }
      })
      .catch((e: any) => {
        setErrorMsg(JSON.stringify(e))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userPoolId])

  const processedConfig = useMemo<ProcessedGuardConfig>(() => {
    const socialConnectionObjs = userPoolConfig.socialConnections.filter(
      (item) => userConfig.socialConnections?.includes(item.provider)
    )
    const enterpriseConnectionObjs = userPoolConfig.enterpriseConnections
      .filter((item) =>
        userConfig.enterpriseConnections?.includes(item.identifier)
      )
      //   OIDC 必须要有 appId
      .filter((item) => item.protocol !== Protocol.OIDC || userConfig.appId)

    return ({
      ...userConfig,
      socialConnectionObjs,
      enterpriseConnectionObjs,
    } as unknown) as ProcessedGuardConfig

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userConfig, userPoolConfig])

  return {
    loading,
    errorMsg,
    userPoolConfig,
    processedConfig,
  }
}

export const GuardLayout = () => {
  const {
    state: { guardScenes },
    setValue,
  } = useGuardContext()

  const { loading, errorMsg, processedConfig } = useProcessConfig()

  useEffect(() => {
    setValue('config', processedConfig)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedConfig])

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
