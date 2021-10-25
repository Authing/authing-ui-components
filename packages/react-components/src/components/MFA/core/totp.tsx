import { Button, Form } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { VerifyCodeInput } from 'src/common/VerifyCodeInput'
import { GuardModuleType } from 'src/components/Guard/module'
import { useGuardHttp } from 'src/utils/guradHttp'
import { GuardMFAInitData, MFAConfig } from '../props'
import { message as Message } from 'antd'

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
      <p className="authing-g2-mfa-tips">
        为了保障访问安全，请前往 OTP 绑定页面
      </p>
      <Button
        className="authing-g2-submit-button g2-mfa-submit-button bind-totp"
        // loading={loading}
        block
        htmlType="submit"
        type="primary"
        size="large"
        onClick={next}
      >
        {t('common.sure')}
      </Button>
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

  const { post } = useGuardHttp()

  const [MFACode, setMFACode] = useState(new Array(6).fill(''))

  const [finish, onFinish] = useAsyncFn(async () => {
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
        <Button
          className="authing-g2-submit-button g2-mfa-submit-button"
          loading={finish.loading}
          block
          htmlType="submit"
          type="primary"
          size="large"
        >
          {t('common.sure')}
        </Button>
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
