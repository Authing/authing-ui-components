import { Form } from 'antd'
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
  return (
    <span onClick={() => changeModule(GuardModuleType.DOWNLOAD_AT)}>
      bind mfa totp
    </span>
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
      <h3 className="authing-g2-mfa-title">{t('login.accPwdLoginVerify')}</h3>
      <p className="authing-g2-mfa-title">{t('login.inputSixCode')}</p>
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
