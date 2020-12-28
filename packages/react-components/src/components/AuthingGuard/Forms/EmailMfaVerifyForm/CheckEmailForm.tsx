import React, { FC, useState } from 'react'
import { Button, Form, Input, message } from 'antd'

import { useGuardContext } from '../../../../context/global/context'
import { MFACheckEmailFormProps } from '../../types'

import './style.less'
import { VALIDATE_PATTERN } from '../../../../utils'

export const CheckEmailForm: FC<MFACheckEmailFormProps> = ({
  onSuccess,
  mfaToken,
}) => {
  const {
    state: { authClient },
  } = useGuardContext()

  const [rawForm] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const onFinish = async ({ email }: any) => {
    try {
      const bindable = await authClient.mfa.phoneOrEmailBindable({
        mfaToken,
        email,
      })
      if (!bindable) {
        message.error(`${email} 已被其他账号绑定`)
        return
      }
      onSuccess(email!)
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h3 className="authing-guard-mfa-title">绑定邮箱</h3>
      <p className="authing-guard-mfa-tips">
        您暂未绑定邮箱，请输入邮箱进行绑定
      </p>
      <Form
        form={rawForm}
        onSubmitCapture={() => setLoading(true)}
        onFinish={onFinish}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: '请输入邮箱',
            },
            {
              pattern: VALIDATE_PATTERN.email,
              message: '邮箱格式错误',
            },
          ]}
        >
          <Input placeholder="请输入邮箱"></Input>
        </Form.Item>

        <Button
          className="authing-guard-mfa-confirm-btn"
          loading={loading}
          block
          htmlType="submit"
          type="primary"
          size="large"
        >
          确定
        </Button>
      </Form>
    </>
  )
}
