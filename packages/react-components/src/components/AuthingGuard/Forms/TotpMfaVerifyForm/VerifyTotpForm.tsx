import React, { FC, useState } from 'react'
import { Button, message } from 'antd'
import { InputSaftyCode } from './BindTotpForm/InputSaftyCode'
import { useMediaSize } from 'src/components/AuthingGuard/hooks'
import { useTranslation } from 'react-i18next'
import { requestClient } from '../../api/http'
import { TotpSource, ErrorCodes } from './UserMfa'
import { useGuardContext } from '../../../../context/global/context'
import { GuardScenes } from '../../../AuthingGuard/types'

export const VerifyTotpForm: FC<any> = ({
  totpSource = TotpSource.SELF,
  className,
}) => {
  const [MFACode, setMFACode] = useState(new Array(6).fill(''))
  const { isPhoneMedia } = useMediaSize()
  const { t } = useTranslation()
  const [loading, setBtnLoading] = useState(false)

  const {
    state: {
      guardEvents,
      authClient,
      mfaData: { mfaToken: MFAToken },
      userPoolId,
      appId,
    },
    setValue,
  } = useGuardContext()

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
        totp: MFACode.join(''),
        source: totpSource,
      }
    )

    if (data.code !== 200) {
      message.error(data.message)
    } else {
      message.success(t('user.bindSuccess'))
      setMFACode(new Array(6).fill(''))
    }
    setBtnLoading(false)
  }

  // 绑定企业
  const bindApplcationTotp = async () => {
    const data: any = await requestClient.post(
      '/api/v2/mfa/totp/associate/confirm',
      {
        authenticator_type: 'totp',
        totp: MFACode.join(''),
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
      setMFACode(new Array(6).fill(''))
      setBtnLoading(false)
      user && guardEvents.onLogin?.(user as any, authClient)
    }
  }

  return (
    <div>
      <InputSaftyCode
        {...{ saftyCode: MFACode, setSaftyCode: setMFACode, isPhoneMedia }}
      />
      <Button
        className="authing-guard-mfa-confirm-btn"
        loading={loading}
        block
        htmlType="submit"
        type="primary"
        size="large"
        onClick={async () => {
          await handleBind()
        }}
      >
        {t('common.sure')}
      </Button>
    </div>
  )
}
