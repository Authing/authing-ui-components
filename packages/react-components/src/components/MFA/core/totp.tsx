import { Button, Form } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from 'src/common/VerifyCodeInput'
import { GuardModuleType } from 'src/components/Guard/module'

const CODE_LEN = 6

export interface BindMFATotpProps {
  mfaToken: string
  changeModule: any
}

export const BindMFATotp: React.FC<BindMFATotpProps> = ({ changeModule }) => {
  const { t } = useTranslation()
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
      >
        {t('common.sure')}
      </Button>
    </>
  )
}

export interface VerifyMFATotpProps {
  mfaToken: string
}

export const VerifyMFATotp: React.FC<VerifyMFATotpProps> = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const [MFACode, setMFACode] = useState(new Array(6).fill(''))

  return (
    <>
      <p className="authing-g2-mfa-title">{t('login.accPwdLoginVerify')}</p>
      <p className="authing-g2-mfa-tips">{t('login.inputSixCode')}</p>
      <Form
        form={form}
        onSubmitCapture={() => {}}
        onFinish={
          () => {}
          //     () =>
          //   onFinish({
          //     totp: MFACode.join(''),
          //   })
        }
      >
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
          // loading={loading}
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
  totpMfaEnabled: boolean
  mfaToken: string
  code: string
  changeModule: any
}

export const MFATotp: React.FC<MFATotpProps> = ({
  totpMfaEnabled,
  mfaToken,
  changeModule,
}) => {
  return (
    <>
      {totpMfaEnabled ? (
        <VerifyMFATotp mfaToken={mfaToken} />
      ) : (
        <BindMFATotp mfaToken={mfaToken} changeModule={changeModule} />
      )}
    </>
  )
}
