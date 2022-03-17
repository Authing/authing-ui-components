import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, message } from 'antd'
import { useGuardAuthClient } from '../../Guard/authClient'
import SubmitButton from '../../SubmitButton'
import CustomFormItem from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
import { useGuardInitData, useGuardIsAuthFlow } from '../../_utils/context'
import { authFlow, ChangePasswordBusinessAction } from '../businessRequest'
interface FirstLoginResetProps {
  onReset: any
}
export const FirstLoginReset: React.FC<FirstLoginResetProps> = ({
  onReset,
}) => {
  const { t } = useTranslation()

  const initData = useGuardInitData<{ token: string }>()

  const isAuthFlow = useGuardIsAuthFlow()

  let [form] = Form.useForm()

  let client = useGuardAuthClient()

  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    let newPassword = values.password
    submitButtonRef.current?.onSpin(true)

    if (isAuthFlow) {
      // 重置密码成功不会返回 UserInfo
      const { isFlowEnd, onGuardHandling } = await authFlow(
        ChangePasswordBusinessAction.ResetPassword,
        {
          password: newPassword,
        }
      )
      submitButtonRef.current?.onSpin(false)
      if (isFlowEnd) {
        onReset()
      } else {
        submitButtonRef.current?.onError()
        onGuardHandling?.()
      }
    } else {
      try {
        let res = await client.resetPasswordByFirstLoginToken({
          token: initData.token,
          password: newPassword,
        })
        onReset(res)
      } catch (error: any) {
        message.error(error.message)
        submitButtonRef?.current?.onError()
      } finally {
        submitButtonRef.current?.onSpin(false)
      }
    }
  }

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
