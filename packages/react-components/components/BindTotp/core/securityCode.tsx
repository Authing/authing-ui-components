import { Form, message } from 'antd'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'

import { GuardModuleType } from '../../Guard/module'
import { useGuardHttp } from '../../_utils/guradHttp'
import SubmitButton from '../../SubmitButton'
import { ImagePro } from '../../ImagePro'
import { VerifyCodeFormItem } from '../../MFA/VerifyCodeInput/VerifyCodeFormItem'
import { VerifyCodeInput } from '../../MFA/VerifyCodeInput'
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
  const submitButtonRef = useRef<any>(null)

  const { t } = useTranslation()

  const { post } = useGuardHttp()

  const onJump = () => {
    changeModule?.(GuardModuleType.DOWNLOAD_AT)
  }

  const [, bindTotp] = useAsyncFn(async () => {
    submitButtonRef.current.onSpin(true)

    try {
      await form.validateFields()
      const saftyCode = form.getFieldValue('saftyCode')

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
        submitButtonRef.current.onError()
        message.error(resMessage)
      } else {
        onNext(data)
      }
    } catch (e: any) {
      submitButtonRef.current.onError()
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }, [mfaToken])

  return (
    <>
      <p className="authing-g2-mfa-title">{t('user.mfaBind')}</p>
      <p
        className="authing-g2-mfa-tips"
        style={{
          textAlign: 'left',
        }}
      >
        {t('common.usePhoneOpen')} Google Authenticator or Microsoft
        Authenticator（{t('common.noValidator')}{' '}
        <span
          style={{
            color: '#396AFF',
            cursor: 'pointer',
          }}
          onClick={onJump}
        >
          {t('common.clickTodownload')}
        </span>
        ） {t('common.mfaText1')}
      </p>
      <ImagePro className="g2-mfa-bindTotp-qrcode" src={qrcode} alt="qrcode" />
      <Form
        className="g2-mfa-bindTotp-securityCode-form"
        form={form}
        onSubmitCapture={() => {}}
        onFinish={bindTotp}
        onFinishFailed={() => submitButtonRef.current.onError()}
      >
        <VerifyCodeFormItem codeLength={6} name="saftyCode">
          <VerifyCodeInput length={6} showDivider={true} gutter={'10px'} />
        </VerifyCodeFormItem>
        <p>{t('user.numberSafteyCode')}</p>
        <SubmitButton text={t('user.nextStep')} ref={submitButtonRef} />
      </Form>
    </>
  )
}
