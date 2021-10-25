import { Button } from 'antd'
import { Form, message } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { VerifyCodeInput } from 'src/common/VerifyCodeInput'
import { GuardModuleType } from 'src/components/Guard/module'
import { useGuardHttp } from 'src/utils/guradHttp'

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

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const onJump = () => {
    changeModule?.(GuardModuleType.DOWNLOAD_AT)
  }

  const [bind, bindTotp] = useAsyncFn(async () => {
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
        <Button
          className="authing-g2-submit-button g2-mfa-submit-button"
          loading={bind.loading}
          block
          htmlType="submit"
          type="primary"
          size="large"
        >
          下一步
        </Button>
      </Form>
    </>
  )
}
