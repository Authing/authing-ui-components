import { Form } from 'antd'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { GuardModuleType } from '../../Guard/module'
import { useGuardHttp } from '../../_utils/guradHttp'
import { GuardMFAInitData, MFAConfig } from '../interface'
import SubmitButton from '../../SubmitButton'
import { VerifyCodeFormItem } from '../VerifyCodeInput/VerifyCodeFormItem'
import { VerifyCodeInput } from '../VerifyCodeInput'
import { ReactComponent as Otp } from '../../assets/svg/img_otp.svg'

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

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Otp style={{ width: 247, height: 131 }} />
      </div>
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

  const [, onFinish] = useAsyncFn(async () => {
    submitButtonRef.current.onSpin(true)

    const mfaCode = form.getFieldValue('mfaCode')
    try {
      const { code, data, message } = await post(
        '/api/v2/mfa/totp/verify',
        {
          totp: mfaCode.join(''),
        },
        {
          headers: {
            authorization: mfaToken,
          },
        }
      )

      if (code !== 200) {
        mfaLogin(code, {
          message,
        })
        submitButtonRef.current.onError()
      } else {
        mfaLogin(200, data)
      }
    } finally {
      submitButtonRef.current.onSpin(false)
    }
  }, [mfaToken])
  return (
    <>
      <p className="authing-g2-mfa-title">{t('login.accPwdLoginVerify')}</p>
      <p className="authing-g2-mfa-tips">{t('login.inputSixCode')}</p>
      <Form
        form={form}
        onSubmitCapture={() => {}}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
      >
        <VerifyCodeFormItem codeLength={6}>
          <VerifyCodeInput
            length={6}
            showDivider={true}
            gutter={'10px'}
            onFinish={onFinish}
          />
        </VerifyCodeFormItem>

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
