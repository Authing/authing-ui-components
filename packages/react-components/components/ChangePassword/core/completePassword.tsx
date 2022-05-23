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
} from '../../_utils/context'
import { GuardModuleType } from '../../Guard'
import { useGuardAuthClient } from '../../Guard/authClient'
export const CompletePassword: React.FC = () => {
  const { t } = useTranslation()

  const events = useGuardEvents()

  const [form] = Form.useForm()

  const { isPhoneMedia } = useMediaSize()

  const authClient = useGuardAuthClient()

  const {
    businessRequestName,
    content,
    isChangeComplete,
  } = useGuardInitData<RegisterCompletePasswordInitData>()

  let submitButtonRef = useRef<any>(null)

  const { changeModule } = useGuardModule()

  const onFinish = useCallback(
    async (values: any) => {
      let newPassword = values.password
      submitButtonRef.current?.onSpin(true)
      if (isChangeComplete) {
        // 需要进行信息补全
        changeModule?.(GuardModuleType.REGISTER_COMPLETE_INFO, {
          businessRequestName,
          content: {
            ...content,
            password: newPassword,
          },
        })
        return
      } else {
        // 直接注册
        try {
          const user = await authClient.registerByPhoneCode(
            content.phone,
            content.code,
            newPassword,
            content.profile,
            content.options
          )
          submitButtonRef.current?.onSpin(false)
          events?.onRegister?.(user, authClient)
          changeModule?.(GuardModuleType.LOGIN)
        } catch (error: any) {
          const { code, message: errorMessage, data } = error
          submitButtonRef.current.onError()
          message.error(errorMessage)
          events?.onRegisterError?.({
            code,
            data,
            message,
          })
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
      events,
      isChangeComplete,
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
