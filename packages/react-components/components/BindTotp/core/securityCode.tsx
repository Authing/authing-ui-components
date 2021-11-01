import { Button } from 'antd'
import { Form, message } from 'antd'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { VerifyCodeInput } from '../../VerifyCodeInput'
import { GuardModuleType } from '../../Guard/module'
import { useGuardHttp } from '../../_utils/guradHttp'
import SubmitButton from '../../SubmitButton'

const CODE_LEN = 6
export interface SecurityCodeProps {
  mfaToken: string
  qrcode: string
  onNext: any
  changeModule: any
}

export const SecurityCode: React.FC<SecurityCodeProps> = ({
  mfaToken,
  qrcode,
  onNext,
  changeModule,
}) => {
  const [form] = Form.useForm()
  const [saftyCode, setSaftyCode] = useState(new Array(CODE_LEN).fill(''))
  const submitButtonRef = useRef<any>(null)

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const onJump = () => {
    changeModule?.(GuardModuleType.DOWNLOAD_AT)
  }

  const [, bindTotp] = useAsyncFn(async () => {
    submitButtonRef.current.onSpin(true)
    try {
      const { code, data, message: resMessage } = await post(
        '/api/v2/mfa/totp/associate/confirm',
        {
          authenticator_type: 'totp',
          totp: saftyCode.join(''),
          source: 'APPLICATION',
        },
        {
          headers: {
            authorization: mfaToken,
          },
        }
      )

      if (code !== 200) {
        message.error(resMessage)
      } else {
        onNext(data)
      }
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }, [mfaToken, saftyCode])

  return (
    <>
      <p className="authing-g2-mfa-title">MFA 绑定</p>
      <p
        className="authing-g2-mfa-tips"
        style={{
          textAlign: 'left',
        }}
      >
        请在手机打开 Google Authenticator / Microsoft
        Authenticator（没有验证器请{' '}
        <span
          style={{
            color: '#396AFF',
            cursor: 'pointer',
          }}
          onClick={onJump}
        >
          点击下载
        </span>
        ） 扫码添加 MFA，在手机查看并输入 6 位数字安全码。
      </p>
      <img className="g2-mfa-bindTotp-qrcode" src={qrcode} alt="qrcode" />
      <Form
        className="g2-mfa-bindTotp-securityCode-form"
        form={form}
        onSubmitCapture={() => {}}
        onFinish={bindTotp}
      >
        <Form.Item
          name="mfaCode"
          className="g2-mfa-totp-verify-input"
          rules={[
            {
              validateTrigger: [],
              validator(r, v, cb) {
                if (saftyCode.some((item) => !item)) {
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
            verifyCode={saftyCode}
            setVerifyCode={setSaftyCode}
          />
        </Form.Item>
        <p>数字安全码</p>
        <SubmitButton text={t('user.nextStep')} ref={submitButtonRef} />
      </Form>
    </>
  )
}
