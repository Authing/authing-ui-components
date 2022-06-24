import React, { useRef, useCallback } from 'react'
import { Form, message } from 'antd'
import CustomFormItem from '../../ValidatorRules'
import { InputPassword } from '../../InputPassword'
import { useMediaSize } from '../../_utils/hooks'
import { IconFont } from '../../IconFont'
import { useTranslation } from 'react-i18next'
import SubmitButton from '../../SubmitButton'
import { RegisterCompletePasswordInitData } from '../../CompleteInfo/interface'
import {
  useGuardEvents,
  useGuardInitData,
  useGuardModule,
  useGuardPublicConfig,
} from '../../_utils/context'
import { GuardModuleType } from '../../Guard'
import { useGuardAuthClient } from '../../Guard/authClient'
import { getGuardHttp } from '../../_utils/guardHttp'
import { usePasswordErrorText } from '../../_utils/useErrorText'
import { ApiCode } from '../../_utils/responseManagement/interface'
export const CompletePassword: React.FC = () => {
  const { t } = useTranslation()

  const events = useGuardEvents()

  const [form] = Form.useForm()

  const { isPhoneMedia } = useMediaSize()

  const authClient = useGuardAuthClient()

  const { post } = getGuardHttp()

  const {
    businessRequestName,
    content,
    isChangeComplete,
    onRegisterSuccess,
    onRegisterFailed,
  } = useGuardInitData<RegisterCompletePasswordInitData>()

  let submitButtonRef = useRef<any>(null)

  const { changeModule } = useGuardModule()
  // 密码加密公钥
  const { publicKey } = useGuardPublicConfig()

  let client = useGuardAuthClient()

  const encrypt = client.options.encryptFunction
  const {
    getPassWordUnsafeText,
    setPasswordErrorTextShow,
  } = usePasswordErrorText()
  const onFinish = useCallback(
    async (values: any) => {
      // 密码加密处理（邮箱验证码是通过 post 直接发送需要加密 其他通过 sdk 在内部加密了 这一步无需加密）
      const password =
        businessRequestName === 'registerByEmailCode'
          ? await encrypt!(values.password, publicKey)
          : values.password

      submitButtonRef.current?.onSpin(true)

      if (isChangeComplete) {
        // 需要进行信息补全
        changeModule?.(GuardModuleType.REGISTER_COMPLETE_INFO, {
          businessRequestName,
          content: {
            ...content,
            password,
          },
          onRegisterSuccess,
          onRegisterFailed,
        })
        return
      } else {
        // 直接注册
        try {
          if (businessRequestName === 'registerByEmailCode') {
            const {
              code: resCode,
              data,
              onGuardHandling,
              message,
            } = await post('/api/v2/register/email-code', {
              email: content.email,
              code: content.code,
              password,
              profile: content.profile,
              ...content.options,
            })
            submitButtonRef.current.onSpin(false)
            if (resCode === 200) {
              onRegisterSuccess(data)
              // events?.onRegister?.(data, authClient)
              // changeModule?.(GuardModuleType.LOGIN)
            } else {
              if (resCode === ApiCode.UNSAFE_PASSWORD_TIP) {
                setPasswordErrorTextShow(true)
              }
              onGuardHandling?.()
              onRegisterFailed(resCode, data, message)
              events?.onRegisterError?.({
                code: resCode,
                data,
                message,
              })
            }
          } else if (businessRequestName === 'registerByPhoneCode') {
            const user = await authClient.registerByPhoneCode(
              content.phone,
              content.code,
              password,
              content.profile,
              content.options
            )
            submitButtonRef.current?.onSpin(false)
            onRegisterSuccess(user)
            // events?.onRegister?.(user, authClient)
            // changeModule?.(GuardModuleType.LOGIN)
          }
        } catch (error: any) {
          const { code, message: errorMessage, data } = error
          if (code === ApiCode.UNSAFE_PASSWORD_TIP) {
            setPasswordErrorTextShow(true)
          }
          submitButtonRef.current.onError()
          message.error(errorMessage)
          onRegisterFailed(code, data, errorMessage)
          // events?.onRegisterError?.({
          //   code,
          //   data,
          //   message,
          // })
        } finally {
          submitButtonRef.current?.onSpin(false)
        }
      }
    },
    [
      authClient,
      businessRequestName,
      changeModule,
      content,
      encrypt,
      events,
      isChangeComplete,
      onRegisterFailed,
      onRegisterSuccess,
      post,
      publicKey,
      setPasswordErrorTextShow,
    ]
  )

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="resetPassword"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => {
          submitButtonRef?.current?.onError()
        }}
        autoComplete="off"
      >
        <CustomFormItem.Password
          className="authing-g2-input-form"
          name="password"
          required={true}
        >
          <InputPassword
            autoFocus={!isPhoneMedia}
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="password2"
          rules={[
            {
              validator(_, value) {
                let pwd = form.getFieldValue('password')
                if (!value) {
                  return Promise.reject(t('login.inputPwd'))
                }
                if (value !== pwd) {
                  return Promise.reject(t('common.repeatPasswordDoc'))
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputPwdAgain')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>
        {getPassWordUnsafeText()}
        <Form.Item className="authing-g2-input-form submit-form">
          <SubmitButton
            className="forget-password"
            text={t('common.confirm')}
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
