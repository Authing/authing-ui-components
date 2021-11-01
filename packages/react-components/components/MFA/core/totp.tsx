import { Form } from 'antd'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { VerifyCodeInput } from '../../VerifyCodeInput'
import { GuardModuleType } from '../../Guard/module'
import { useGuardHttp } from '../../_utils/guradHttp'
import { GuardMFAInitData, MFAConfig } from '../props'
import { message as Message } from 'antd'
import SubmitButton from '../../SubmitButton'

const CODE_LEN = 6

export interface BindMFATotpProps {
  initData: GuardMFAInitData
  changeModule: any
}

export const BindMFATotp: React.FC<BindMFATotpProps> = ({
  changeModule,
  initData,
}) => {
  const { t } = useTranslation()

  const next = () => changeModule(GuardModuleType.BIND_TOTP, initData)
  return (
    <>
      <p className="authing-g2-mfa-title">{t('common.bindTotp')}</p>
      <p className="authing-g2-mfa-tips">{t('common.otpText1')}</p>
      <SubmitButton
        text={t('common.sure')}
        onClick={next}
        className="g2-mfa-submit-button bind-totp"
      />
    </>
  )
}

export interface VerifyMFATotpProps {
  mfaToken: string
  mfaLogin: any
}

export const VerifyMFATotp: React.FC<VerifyMFATotpProps> = ({
  mfaToken,
  mfaLogin,
}) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const submitButtonRef = useRef<any>(null)

  const { post } = useGuardHttp()

  const [MFACode, setMFACode] = useState(new Array(6).fill(''))

  const [, onFinish] = useAsyncFn(async () => {
    submitButtonRef.current.onSpin(true)
    try {
      const { code, data, message } = await post(
        '/api/v2/mfa/totp/verify',
        {
          totp: MFACode.join(''),
        },
        {
          headers: {
            authorization: mfaToken,
          },
        }
      )

      if (code !== 200) {
        mfaLogin(200, message)
        Message.error(message)
      } else {
        mfaLogin(200, data)
      }
    } finally {
      submitButtonRef.current.onSpin(false)
    }
  }, [mfaToken, MFACode])

  return (
    <>
      <p className="authing-g2-mfa-title">{t('login.accPwdLoginVerify')}</p>
      <p className="authing-g2-mfa-tips">{t('login.inputSixCode')}</p>
      <Form form={form} onSubmitCapture={() => {}} onFinish={onFinish}>
        <Form.Item
          name="mfaCode"
          className="g2-mfa-totp-verify-input"
          rules={[
            {
              validateTrigger: [],
              validator(r, v, cb) {
                if (MFACode.some((item) => !item)) {
                  cb(t('login.inputFullMfaCode'))
                  return
                }
                cb()
              },
            },
          ]}
        >
          <VerifyCodeInput
            length={CODE_LEN}
            verifyCode={MFACode}
            setVerifyCode={setMFACode}
          />
        </Form.Item>
        <SubmitButton text={t('common.sure')} ref={submitButtonRef} />
      </Form>
    </>
  )
}

export interface MFATotpProps {
  changeModule: any
  config: MFAConfig
  initData: GuardMFAInitData
  mfaLogin: any
}

export const MFATotp: React.FC<MFATotpProps> = ({
  changeModule,
  initData,
  mfaLogin,
}) => {
  return (
    <>
      {initData.totpMfaEnabled ? (
        <VerifyMFATotp mfaToken={initData.mfaToken} mfaLogin={mfaLogin} />
      ) : (
        <BindMFATotp initData={initData} changeModule={changeModule} />
      )}
    </>
  )
}
