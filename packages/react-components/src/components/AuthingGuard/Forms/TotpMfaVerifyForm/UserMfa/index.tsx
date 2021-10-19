import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Steps, message, Spin, Button, Space } from 'antd'
import { useMediaSize } from 'src/components/AuthingGuard/hooks'
import { useTranslation } from 'react-i18next'
import { requestClient } from '../../../api/http'
import { MobileSteps } from '../MobileSteps'
import { AppDownload } from '../BindTotpForm/AppDownload'
import { ScanQrcode } from '../BindTotpForm/ScanQrcode'
import { InputSaftyCode } from '../BindTotpForm/InputSaftyCode'
import { User } from 'authing-js-sdk'
import { SaveSecretKey } from '../BindTotpForm/SaveSecretKey'
import { BindSuccess } from '../BindTotpForm/BindSuccess'
import { useGuardContext } from '../../../../../context/global/context'
import { GuardScenes } from '../../../../AuthingGuard/types'
import { MediaAppDownload } from '../BindTotpForm/AppDownload'

import './style.less'

const { Step } = Steps

// 临时
export const ErrorCodes = {
  // 密码错误
  WRONG_PASSWORD: 2006,
  // 未登录
  LOGIN_REQUIRED: 2020,
  // 用户或密码错误
  USER_OR_PASSWORD_WRONG: 2333,
  // 用户不存在
  USER_NOT_EXISTS: 2004,
  // TOP MFA 的 error code
  OTP_MFA_CODE: 1635,
  // 手机和短信验证吗 MFA 的 error code
  MSG_MFA_CODE: 1636,
  // MFA Token 失效
  MAF_TOKEN_INVALID: 2021,
  // 强制修改密码
  FIRST_LOGIN_CODE: 1639,
  // 密码输入错误次数已达上限
  ACCOUNT_LOCK: 2057,
  // 账号已经锁定了
  ACCOUNT_LOCKED: 2005,
  // 密码已过期
  PASSWORD_EXPIRED: 2058,
  // 使用过的密码
  USED_PASSWORD: 2059,
}

// 估计是为了区分个人版和企业版
export enum TotpSource {
  SELF = 'SELF',
  APPLICATION = 'APPLICATION',
}

// 组件的属性
export interface UserMfaProps {
  // 用户池id
  userPoolId: string
  // 用户池名称
  userPoolName: string
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
  userPoolName,
  userPoolId,
  appId,
  className,
  onSuccess,
  onFail,
}) => {
  // 多语言翻译
  const { t } = useTranslation()
  // 判断是否移动端
  const { isPhoneMedia } = useMediaSize()
  // 验证码组件需要一个初始化的值
  const getInitSaftyCode = () => new Array(6).fill('')
  // 6位安全码
  const [saftyCode, setSaftyCode] = useState<string[]>(getInitSaftyCode())
  // 加载状态
  const [isSpinning, setIsSpinning] = useState(false)
  // 当前的步骤
  const [currentStep, setCurrentStep] = useState<number>(0)
  // 绑定 mfa 的密钥
  const [secret, setSecret] = useState('')
  // 绑定 mfa 的二维码
  const [qrcode, setQrcode] = useState('')
  //
  const [mfaSecret, setMfaSecret] = useState('')
  // 按钮的加载状态
  const [btnLoading, setBtnLoading] = useState(false)
  //
  const [isSaved, setIsSaved] = useState(false)
  //
  const [user, setUser] = useState<User>()

  const { setValue } = useGuardContext()

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
        await bindSelfTotp()
      } else {
        await bindApplcationTotp()
      }
    } catch (e) {
      message.error(t('user.bindFail'))
    } finally {
      setBtnLoading(false)
    }
  }

  // 绑定个人
  const bindSelfTotp = async () => {
    const data: any = await requestClient.post(
      '/api/v2/mfa/totp/associate/confirm',
      {
        authenticator_type: 'totp',
        totp: saftyCode.join(''),
        source: totpSource,
      }
    )

    if (data.code !== 200) {
      message.error(data.message)
    } else {
      message.success(t('user.bindSuccess'))
      setCurrentStep((state) => state + 1)
      setSaftyCode(getInitSaftyCode())
    }
    setBtnLoading(false)
  }

  // 绑定企业
  const bindApplcationTotp = async () => {
    const data: any = await requestClient.post(
      '/api/v2/mfa/totp/associate/confirm',
      {
        authenticator_type: 'totp',
        totp: saftyCode.join(''),
        source: totpSource,
      },
      {
        headers: {
          authorization: MFAToken,
          'x-authing-userpool-id': userPoolId,
          'x-authing-app-id': appId,
        },
      }
    )
    // 登录失效的校验
    if (data.code === ErrorCodes.MAF_TOKEN_INVALID) {
      message.error(t('common.mfaInvalidContent'))
      setValue('guardScenes', GuardScenes.AppMfaVerify)
    } else if (data.code !== 200) {
      message.error(data.message)
    } else {
      const user = data?.data
      message.success(t('user.bindSuccess'))
      setCurrentStep((state) => state + 1)
      setSaftyCode(getInitSaftyCode())
      setBtnLoading(false)
      user && setUser(user)
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
  const handleNextStep = async () => {
    if (currentStep === 2) {
      await handleBind()
    } else {
      setCurrentStep((state) => state + 1)
    }
  }

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
  const STEP_MAP = useMemo(
    () => [
      !isPhoneMedia ? <AppDownload /> : <MediaAppDownload />,
      <ScanQrcode
        isPhoneMedia={isPhoneMedia}
        qrcode={qrcode}
        secret={mfaSecret}
        userpoolName={userPoolName}
      />,
      <InputSaftyCode {...{ saftyCode, setSaftyCode, isPhoneMedia }} />,
      <SaveSecretKey {...{ secret, setIsSaved, isSaved }} />,
      <BindSuccess totpSource={totpSource} user={user} />,
    ],
    [
      isPhoneMedia,
      qrcode,
      secret,
      setSaftyCode,
      saftyCode,
      isSaved,
      user,
      totpSource,
      mfaSecret,
      userPoolName,
    ]
  )

  // 下一步是否可用
  const DISABLE_MAP = [
    false,
    false,
    saftyCode.some((item) => !item),
    !isSaved,
    false,
  ]

  // 组件挂载
  useEffect(() => {
    handleAsyncComponentDidMount()
  }, [handleAsyncComponentDidMount])
  return (
    <Spin spinning={isSpinning}>
      <div>
        <div>{useSteps}</div>
        <div className="userMfaContent">{STEP_MAP[currentStep]}</div>
        <div className="userMfaBtns">
          <Space size={16}>
            {(currentStep === 1 || currentStep === 2) && (
              <Button
                loading={btnLoading}
                size="large"
                onClick={handlePrevStep}
              >
                {t('user.prevStep')}
              </Button>
            )}
            {currentStep !== 4 && (
              <Button
                loading={btnLoading}
                disabled={DISABLE_MAP[currentStep]}
                size="large"
                type="primary"
                onClick={handleNextStep}
              >
                {t('user.nextStep')}
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Spin>
  )
}
