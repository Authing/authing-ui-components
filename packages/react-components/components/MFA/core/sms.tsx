import { message } from 'antd'
import { Form } from 'antd'
import { SceneType, User } from 'authing-js-sdk'
import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from '../VerifyCodeInput'
import { useGuardAuthClient } from '../../Guard/authClient'
import { SendCodeBtn } from '../../SendCode/SendCodeBtn'
import SubmitButton from '../../SubmitButton'
import CustomFormItem, { ICheckProps } from '../../ValidatorRules'
import { VerifyCodeFormItem } from '../VerifyCodeInput/VerifyCodeFormItem'
import { MFAConfig } from '../interface'
import { InputNumber } from '../../InputNumber'
import { IconFont } from '../../IconFont'
import { phoneDesensitization } from '../../_utils'
import { useGuardPublicConfig } from '../../_utils/context'
import { useMfaBusinessRequest, MfaBusinessAction } from '../businessRequest'
export interface BindMFASmsProps {
  mfaToken: string
  onBind: (phone: string) => void
  config: any
}

export const BindMFASms: React.FC<BindMFASmsProps> = ({
  mfaToken,
  onBind,
  config,
}) => {
  const submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const ref = useRef<ICheckProps>(null)
  const onFinish = async ({ phone }: any) => {
    submitButtonRef.current.onSpin(true)
    await form.validateFields()
    try {
      onBind(phone)
    } catch (e) {
      // do nothing
      submitButtonRef.current?.onError()
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }

  return (
    <>
      <h3 className="authing-g2-mfa-title">{t('common.bindPhone')}</h3>
      <p className="authing-g2-mfa-tips">{t('login.bindPhoneInfo')}</p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        onValuesChange={(values) => {
          ref.current?.check(values)
        }}
      >
        <CustomFormItem.Phone
          className="authing-g2-input-form"
          name="phone"
          form={form}
          ref={ref}
          checkRepeat={true}
          required={true}
        >
          <InputNumber
            className="authing-g2-input"
            autoComplete="off"
            size="large"
            placeholder={t('login.inputPhone')}
            prefix={
              <IconFont
                type="authing-a-smartphone-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Phone>
        <SubmitButton text={t('common.sure')} ref={submitButtonRef} />
      </Form>
    </>
  )
}

export interface VerifyMFASmsProps {
  mfaToken: string
  phone: string
  onVerify: (code: number, data: any) => void
  sendCodeRef: React.RefObject<HTMLButtonElement>
  codeLength: number
}

export const VerifyMFASms: React.FC<VerifyMFASmsProps> = ({
  mfaToken,
  phone,
  onVerify,
  sendCodeRef,
  codeLength = 4,
}) => {
  const authClient = useGuardAuthClient()

  const submitButtonRef = useRef<any>(null)

  const { t } = useTranslation()

  const [form] = Form.useForm()

  const [sent, setSent] = useState<boolean>(false)

  const businessRequest = useMfaBusinessRequest()[MfaBusinessAction.VerifySms]

  const onFinish = async (values: any) => {
    submitButtonRef.current.onSpin(true)
    const mfaCode = form.getFieldValue('mfaCode')

    const requestData = {
      mfaToken,
      phone: phone!,
      code: mfaCode.join(''),
    }

    try {
      const res = await businessRequest(requestData)

      if (res.code === 200) onVerify(200, res.data)
    } catch (e) {
      const error = JSON.parse(e.message)
      submitButtonRef.current.onError()
      onVerify(error.code as number, error)
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }

  const tips = useMemo(
    () =>
      sent
        ? `${t('login.verifyCodeSended')} ${phoneDesensitization(phone)}`
        : '',
    [phone, sent, t]
  )

  const sendVerifyCode = async () => {
    try {
      await authClient.sendSmsCode(phone!, '', SceneType.SCENE_TYPE_MFA_VERIFY)
      return true
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        message.error(t('login.sendCodeTimeout'))
        return false
      }
      const errorMessage = JSON.parse(e.message)
      message.error(errorMessage.message)
      return false
    }
  }

  return (
    <>
      <h3 className="authing-g2-mfa-title">{t('login.inputPhoneCode')}</h3>
      <p className="authing-g2-mfa-tips">{tips}</p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
      >
        <VerifyCodeFormItem
          codeLength={codeLength}
          ruleKeyword={t('common.captchaCode')}
        >
          <VerifyCodeInput length={codeLength} onFinish={onFinish} />
        </VerifyCodeFormItem>

        <SendCodeBtn
          btnRef={sendCodeRef}
          beforeSend={() => sendVerifyCode()}
          type="link"
          setSent={setSent}
        />

        <SubmitButton
          text={t('common.sure')}
          ref={submitButtonRef}
          className="g2-mfa-submit-button"
        />
      </Form>
    </>
  )
}

export const MFASms: React.FC<{
  mfaToken: string
  phone?: string
  mfaLogin: any
  config: MFAConfig
}> = ({ phone: userPhone, mfaToken, mfaLogin, config }) => {
  const [phone, setPhone] = useState(userPhone)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  const publicConfig = useGuardPublicConfig()

  const codeLength = publicConfig?.verifyCodeLength

  return (
    <>
      {phone ? (
        <VerifyMFASms
          mfaToken={mfaToken}
          phone={phone}
          onVerify={(code, data) => {
            mfaLogin(code, data)
          }}
          codeLength={codeLength ?? 4}
          sendCodeRef={sendCodeRef}
        />
      ) : (
        <BindMFASms
          config={config}
          mfaToken={mfaToken}
          onBind={(phone: string) => {
            setPhone(phone)
            sendCodeRef.current?.click()
          }}
        />
      )}
    </>
  )
}
