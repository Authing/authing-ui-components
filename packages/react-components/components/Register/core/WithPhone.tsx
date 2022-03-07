import { Form } from 'antd'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import { useGuardAuthClient } from '../../Guard/authClient'
import { fieldRequiredRule, getDeviceName } from '../../_utils'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'
import { InputNumber } from '../../InputNumber'
import CustomFormItem, {
  ICheckProps,
  // ValidatorFormItemProps,
} from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { SceneType } from 'authing-js-sdk'
import { SendCodeByPhone } from '../../SendCode/SendCodeByPhone'
// import { FormItemIdentify } from '../../Login/core/withVerifyCode/FormItemIdentify'
// import { Rule } from 'antd/lib/form'

export interface RegisterWithPhoneProps {
  onRegister: Function
  agreements: Agreement[]
  publicConfig?: ApplicationConfig
  registeContext?: any
}

export const RegisterWithPhone: React.FC<RegisterWithPhoneProps> = ({
  onRegister,
  agreements,
  publicConfig,
  registeContext,
}) => {
  const { t } = useTranslation()
  const submitButtonRef = useRef<any>(null)
  const authClient = useGuardAuthClient()
  const [form] = Form.useForm()
  const [phone, setPhone] = useState<string>('')
  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)

  const ref = useRef<ICheckProps>(null)

  const verifyCodeLength = publicConfig?.verifyCodeLength ?? 4

  const [, onFinish] = useAsyncFn(
    async (values: any) => {
      try {
        submitButtonRef.current.onSpin(true)
        await form.validateFields()

        setValidated(true)

        if (agreements?.length && !acceptedAgreements) {
          // message.error(t('common.registerProtocolTips'))
          submitButtonRef.current.onError()
          // submitButtonRef.current.onSpin(false)
          return
        }

        const { phone, password = '', code } = values

        const context = registeContext ?? {}

        // 注册
        const user = await authClient.registerByPhoneCode(
          phone,
          code,
          password,
          {
            browser:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
            device: getDeviceName(),
          },
          {
            context,
            generateToken: true,
            // params: getUserRegisterParams(),
          }
        )
        submitButtonRef.current.onSpin(false)
        onRegister(200, user)
      } catch (error: any) {
        const { code, message, data } = error
        submitButtonRef.current.onError()
        onRegister(code, data, message)
      } finally {
        submitButtonRef.current.onSpin(false)
      }
    },
    [form, acceptedAgreements],
    { loading: false }
  )

  // const PhoenAccountItem = useCallback(() => {
  //   if (publicConfig && publicConfig.internationalSmsConfig?.enabled) {
  //     return (
  //       <FormItemIdentify
  //         name="identify"
  //         className="authing-g2-input-form remove-padding"
  //         methods="phone-code"
  //         currentMethod="phone-code"
  //         areaCode={areaCode}
  //       >
  //         {isInternationSms ? (
  //           <InputInternationPhone
  //             className="authing-g2-input"
  //             size="large"
  //             areaCode={areaCode}
  //             methods={methods}
  //             onAreaCodeChange={(value: string) => {
  //               setAreaCode(value)
  //             }}
  //           />
  //         ) : (
  //           <InputIdentify
  //             className="authing-g2-input"
  //             size="large"
  //             value={identify}
  //             methods={methods}
  //             onChange={(e) => {
  //               let v = e.target.value
  //               setIdentify(v)
  //               if (validate('email', v)) {
  //                 setCurrentMethod(InputMethod.EmailCode)
  //               }
  //               if (validate('phone', v)) {
  //                 setCurrentMethod(InputMethod.PhoneCode)
  //               }
  //             }}
  //             prefix={
  //               <IconFont
  //                 type="authing-a-user-line1"
  //                 style={{ color: '#878A95' }}
  //               />
  //             }
  //           />
  //         )}
  //       </FormItemIdentify>
  //     )
  //   }
  // }, [publicConfig])
  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        onValuesChange={(values) => {
          ref.current?.check(values)
        }}
      >
        <CustomFormItem.Phone
          ref={ref}
          key="phone"
          name="phone"
          className="authing-g2-input-form"
          validateFirst={true}
          form={form}
          checkRepeat={true}
          required={true}
        >
          <InputNumber
            className="authing-g2-input"
            onChange={(e) => {
              setPhone(e.target.value)
            }}
            size="large"
            placeholder={t('login.inputPhone')}
            // prefix={<UserOutlined style={{ color: '#878A95' }} />}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
            maxLength={11}
          />
        </CustomFormItem.Phone>
        <Form.Item
          key="code"
          name="code"
          validateTrigger={['onBlur', 'onChange']}
          rules={fieldRequiredRule(t('common.captchaCode'))}
          className="authing-g2-input-form"
          validateFirst={true}
        >
          <SendCodeByPhone
            className="authing-g2-input g2-send-code-input"
            autoComplete="off"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            maxLength={verifyCodeLength}
            scene={SceneType.SCENE_TYPE_REGISTER}
            prefix={
              <IconFont
                type="authing-a-shield-check-line1"
                style={{ color: '#878A95' }}
              />
            }
            onSendCodeBefore={() => form.validateFields(['phone'])}
            data={phone}
          />
        </Form.Item>
        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
        <Form.Item>
          <SubmitButton text={t('common.register')} ref={submitButtonRef} />
        </Form.Item>
      </Form>
    </div>
  )
}
