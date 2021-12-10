import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, message } from 'antd'
import SubmitButton from '../../SubmitButton'
import { useAuthClient } from '../../Guard/authClient'
import CustomFormItem from '../../ValidatorRules'
import { fieldRequiredRule } from '../../_utils'
import { InputPassword } from '../../InputPassword'
import { IconFont } from '../../IconFont'

interface RotateResetProps {
  onReset: any
  publicConfig: any
  initData: any
}

export const RotateReset = (props: RotateResetProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let authClient = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    let { password, oldPassword } = values
    submitButtonRef?.current?.onSpin(true)

    try {
      let res = await authClient.resetPasswordByForceResetToken({
        token: props.initData.token,
        newPassword: password,
        oldPassword: oldPassword,
      })
      props.onReset({ code: 200, data: res })
    } catch (error) {
      message.error(error.message)
      submitButtonRef?.current?.onError()
    } finally {
      submitButtonRef?.current?.onSpin(false)
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
        <Form.Item
          className="authing-g2-input-form"
          name="oldPassword"
          rules={[...fieldRequiredRule(t('common.password'))]}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('user.inputCurrPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>
        <CustomFormItem.Password
          className="authing-g2-input-form"
          name="password"
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
        <CustomFormItem.Password
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
        </CustomFormItem.Password>
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
