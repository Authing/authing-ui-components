import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, message } from 'antd'
import { useAuthClient } from '../../Guard/authClient'
import SubmitButton from '../../SubmitButton'
import CustomFormItem from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
interface FirstLoginResetProps {
  onReset: any
  publicConfig: any
  initData: any
}
export const FirstLoginReset = (props: FirstLoginResetProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let client = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    let newPassword = values.password
    submitButtonRef.current?.onSpin(false)
    try {
      let res = await client.resetPasswordByFirstLoginToken({
        token: props.initData.token,
        password: newPassword,
      })
      props.onReset(res)
    } catch (error: any) {
      message.error(error.message)
      submitButtonRef?.current?.onError()
    } finally {
      submitButtonRef.current?.onSpin(false)
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
