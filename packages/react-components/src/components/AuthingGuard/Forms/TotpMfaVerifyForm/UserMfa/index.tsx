import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Steps, message, Spin, Button } from 'antd'
import { useMediaSize } from 'src/components/AuthingGuard/hooks'
import { useTranslation } from 'react-i18next'
import { requestClient } from '../../../api/http'
import { MobileSteps } from '../MobileSteps'
import { AppDownload } from '../BindTotpForm/AppDownload'

import './style.less'

const { Step } = Steps

// 估计是为了区分个人版和企业版
export enum TotpSource {
  SELF = 'SELF',
  APPLICATION = 'APPLICATION',
}

// 组件的属性
export interface UserMfaProps {
  // 用户池id
  userPoolId: string
  // 应用id
  appId: string
  // 区分个人版还是企业版
  totpSource?: TotpSource
  MFAToken?: string
  className?: string
}

// 不知道为啥叫做 UserMfa, 只知道这个组件是为了绑定 otp
export const UserMfa: React.FC<any> = ({
  totpSource = TotpSource.SELF,
  MFAToken,
  userPoolId,
  appId,
  className,
}) => {
  // 多语言翻译
  const { t } = useTranslation()
  // 判断是否移动端
  const { isPhoneMedia } = useMediaSize()
  // 验证码组件需要一个初始化的值
  const getInitSaftyCode = () => new Array(6).fill('')
  // 加载状态
  const [isSpinning, setIsSpinning] = useState(false)
  // 当前的步骤
  const [currentStep, setCurrentStep] = useState<number>(0)
  //
  const [secret, setSecret] = useState('')
  //
  const [qrcode, setQrcode] = useState('')
  //
  const [mfaSecret, setMfaSecret] = useState('')
  // 按钮的加载状态
  const [btnLoading, setBtnLoading] = useState(false)

  // 根据配置判断 enable 字段，如果满足直接进入到最后一步 （这块不敢删也不知道有啥用。。。。）
  // guard 和 user-portal 网络请求还不一样
  const handleCheckAuthenticator = useCallback(async () => {
    const config: {
      headers?: any
    } = {}
    if (totpSource === TotpSource.APPLICATION) {
      config.headers = {
        authorization: MFAToken,
        'x-authing-userpool-id': userPoolId,
        'x-authing-app-id': appId,
      }
    }
    const query = {
      type: 'totp',
      source: totpSource,
    }
    return await requestClient.get<any>(
      `/api/v2/mfa/authenticator`,
      query,
      config
    )
  }, [MFAToken, totpSource, userPoolId, appId])

  // 绑定所需要的一些配置信息
  const handleFetchBindInfo = useCallback(async () => {
    setIsSpinning(true)
    try {
      const config: {
        headers?: any
      } = {}
      if (totpSource === TotpSource.APPLICATION) {
        config.headers = {
          authorization: MFAToken,
          'x-authing-userpool-id': userPoolId,
          'x-authing-app-id': appId,
        }
      }
      const data: any = await requestClient.post(
        '/api/v2/mfa/totp/associate',
        {
          authenticator_type: 'totp',
          source: totpSource,
        },
        config as any
      )
      setSecret(data.data.recovery_code)
      setQrcode(data.data.qrcode_data_url)
      setMfaSecret(data.data.secret)
      setIsSpinning(false)
    } catch (e) {
      message.error(t('user.bindInfoFetchFail'))
      setIsSpinning(false)
    }
  }, [t, totpSource, MFAToken, userPoolId, appId])

  // 开始绑定
  const handleBind = async () => {
    setBtnLoading(true)
    try {
      if (totpSource === TotpSource.SELF) {
        // await bindSelfTotp()
      } else {
        // await bindApplcationTotp()
      }
    } catch (e) {
      message.error(t('user.bindFail'))
    } finally {
      setBtnLoading(false)
    }
  }

  // 组件挂载时触发的方法
  const handleAsyncComponentDidMount = useCallback(async () => {
    try {
      const data = await handleCheckAuthenticator()
      if (data.data.some((item: any) => item.enable)) {
        setCurrentStep(4)
        setIsSpinning(false)
        return
      }
      handleFetchBindInfo()
    } catch (err) {
      setIsSpinning(false)
    }
  }, [handleCheckAuthenticator, handleFetchBindInfo])

  // 下一步按钮事件
  const handleNextStep = useCallback(async () => {
    if (currentStep === 2) {
      await handleBind()
    } else {
      setCurrentStep((state) => state + 1)
    }
  }, [])

  // 上一步按钮事件
  const handlePrevStep = () => {
    setCurrentStep((state) => state - 1)
  }

  // 渲染步骤条
  const useSteps = useMemo(
    () =>
      isPhoneMedia ? (
        <MobileSteps
          current={currentStep}
          data={[
            t('common.downloadTotpApp'),
            t('user.addMfa'),
            t('user.inputSafteyCode'),
            t('user.saveRecoverCode'),
            t('user.bindFinish'),
          ]}
        />
      ) : (
        <Steps size="small" current={currentStep}>
          <Step title={`${t('common.step')} 1`} />
          <Step title={`${t('common.step')} 2`} />
          <Step title={`${t('common.step')} 3`} />
          <Step title={`${t('common.step')} 4`} />
          <Step title={`${t('common.step')} 5`} />
        </Steps>
      ),
    [currentStep, isPhoneMedia, t]
  )

  //渲染内容
  const STEP_MAP = useMemo(() => [!isPhoneMedia ? <AppDownload /> : null], [
    isPhoneMedia,
  ])

  // 组件挂载
  useEffect(() => {
    handleAsyncComponentDidMount()
  }, [handleAsyncComponentDidMount])
  return (
    <Spin spinning={isSpinning}>
      <div>
        <div>{useSteps}</div>
        <div>{STEP_MAP[currentStep]}</div>
        <div>
          {(currentStep === 1 || currentStep === 2) && (
            <Button loading={btnLoading} size="large" onClick={handlePrevStep}>
              {t('user.prevStep')}
            </Button>
          )}
          {currentStep !== 4 && (
            <Button
              loading={btnLoading}
              size="large"
              type="primary"
              onClick={handleNextStep}
            >
              {t('user.nextStep')}
            </Button>
          )}
        </div>
      </div>
    </Spin>
  )
}
