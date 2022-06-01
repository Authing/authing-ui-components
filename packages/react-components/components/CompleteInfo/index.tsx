import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePro } from '../ImagePro'
import { CompleteInfo } from './core/completeInfo'
import {
  CompleteInfoInitData,
  CompleteInfoMetaData,
  CompleteInfoRequest,
  OmitCompleteInfo,
  RegisterCompleteInfoInitData,
} from './interface'
import './styles.less'
import { IconFont } from '../IconFont'
import { useGuardAuthClient } from '../Guard/authClient'
import {
  useGuardEvents,
  useGuardFinallyConfig,
  useGuardHttpClient,
  useGuardInitData,
  useGuardModule,
  useGuardPublicConfig,
} from '../_utils/context'
import {
  authFlow,
  CompleteInfoAuthFlowAction,
  registerRequest,
} from './businessRequest'
import { extendsFieldsToMetaData, fieldValuesToRegisterProfile } from './utils'
import { GuardModuleType } from '../Guard'
import { Button, message } from 'antd'

export const GuardCompleteInfo: React.FC<{
  metaData: CompleteInfoMetaData[]
  skipComplateFileds: boolean
  businessRequest: (
    action: CompleteInfoAuthFlowAction,
    data?: CompleteInfoRequest
  ) => Promise<void>
}> = ({ metaData, businessRequest, skipComplateFileds }) => {
  const config = useGuardFinallyConfig()

  const { t } = useTranslation()

  const [skipLoading, setSkipLoading] = useState(false)

  const onSkip = async () => {
    setSkipLoading(true)

    await businessRequest(CompleteInfoAuthFlowAction.Skip)
    setSkipLoading(false)
  }

  return (
    <div className="g2-view-container g2-complete-info">
      <div className="g2-view-header">
        <div className="g2-completeInfo-header">
          <ImagePro
            src={config?.logo!}
            size={48}
            borderRadius={4}
            alt=""
            className="icon"
          />

          {skipComplateFileds && (
            // <span
            //   className="g2-completeInfo-header-skip"
            //   onClick={() => onSkip()}
            // >
            //   <IconFont type="authing-a-share-forward-line1" />
            //   <span>{t('common.skip')}</span>
            // </span>
            <Button
              className="g2-completeInfo-header-skip"
              type="text"
              loading={skipLoading}
              onClick={() => onSkip()}
            >
              <IconFont type="authing-a-share-forward-line1" />
              <span>{t('common.skip')}</span>
            </Button>
          )}
        </div>

        <div className="title">{t('common.perfectUserInfo')}</div>
        <div className="title-explain">
          {t('common.welcomeDoc', { name: config.title })}
        </div>
      </div>
      <div className="g2-view-tabs g2-completeInfo-content">
        <CompleteInfo
          metaData={metaData}
          businessRequest={async (data) =>
            await businessRequest?.(CompleteInfoAuthFlowAction.Complete, data)
          }
        />
      </div>
    </div>
  )
}

export const GuardLoginCompleteInfoView: React.FC = () => {
  const { metaData, skip } = useGuardInitData<CompleteInfoInitData>()

  const events = useGuardEvents()

  const authClient = useGuardAuthClient()

  const businessRequest = async (
    action: CompleteInfoAuthFlowAction,
    data?: CompleteInfoRequest
  ) => {
    const { isFlowEnd, data: resData, onGuardHandling } = await authFlow(
      action,
      data
    )

    if (isFlowEnd) {
      events?.onLogin?.(resData, authClient)
    } else {
      onGuardHandling?.()
    }
  }

  return (
    <GuardCompleteInfo
      metaData={metaData}
      businessRequest={businessRequest}
      skipComplateFileds={skip}
    />
  )
}

export const GuardRegisterCompleteInfoView: React.FC = () => {
  const initData = useGuardInitData<RegisterCompleteInfoInitData>()

  const { changeModule } = useGuardModule()

  const publicConfig = useGuardPublicConfig()

  const { get } = useGuardHttpClient()

  const config = useGuardFinallyConfig()

  const events = useGuardEvents()

  const authClient = useGuardAuthClient()

  const [selectOptions, setSelectOptions] = useState<
    Array<{
      key: string
      options: {
        value: string
        label: string
      }[]
    }>
  >()

  const [metaData, setMetaData] = useState<CompleteInfoMetaData[]>()

  // 过滤掉 phone 或者 email
  const extendsFields = useMemo(() => {
    return publicConfig?.extendsFields.filter(
      (field) => field.name !== OmitCompleteInfo[initData.businessRequestName]
    )
  }, [initData.businessRequestName, publicConfig?.extendsFields])

  const skipComplateFileds = publicConfig?.skipComplateFileds

  const loadingComponent = useMemo(() => {
    return config.loadingComponent
  }, [config.loadingComponent])

  const loadSelectOptions = useCallback(async () => {
    const { data: selectOptions } = await get(
      `/api/v2/udfs/field-metadata-for-completion`,
      undefined,
      {}
    )

    setSelectOptions(selectOptions)
  }, [get])

  const businessRequest = async (
    action: CompleteInfoAuthFlowAction,
    data?: CompleteInfoRequest
  ) => {
    const registerProfile = fieldValuesToRegisterProfile(
      extendsFields,
      data?.fieldValues
    )
    try {
      // sdk 直接 throw error 拿不到错误详细信息 不能手动给他执行我们的拦截
      const user = await registerRequest(
        action,
        initData.businessRequestName,
        initData.content,
        registerProfile
      )

      if (user) {
        events?.onRegister?.(user, authClient)
        changeModule?.(GuardModuleType.LOGIN)
      }
    } catch (error: any) {
      message.error(error.message)
    }
  }

  useEffect(() => {
    loadSelectOptions()
  }, [loadSelectOptions])

  useEffect(() => {
    if (!selectOptions) return

    const metaData = extendsFieldsToMetaData(extendsFields, selectOptions)

    setMetaData(metaData)
  }, [extendsFields, selectOptions])

  return (
    <>
      {!metaData ? (
        loadingComponent
      ) : (
        <GuardCompleteInfo
          metaData={metaData}
          skipComplateFileds={skipComplateFileds}
          businessRequest={businessRequest}
        />
      )}
    </>
  )
}
