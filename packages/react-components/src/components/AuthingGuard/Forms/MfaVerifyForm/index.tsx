import { User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'
import { Button, Form } from 'antd'

import { VerifyCodeInput } from '../../../../common/VerifyCodeInput'
import { useGuardContext } from '../../../../context/global/context'
import { MfaVerifyForm } from '../../../../components/AuthingGuard/types'

import './style.less'

const CODE_LEN = 6

export const MFAVerifyForm: FC<MfaVerifyForm> = ({
  onSuccess,
  onFail,
  goReset,
}) => {
  const {
    state: { authClient, mfaToken },
  } = useGuardContext()

  const [rawForm] = Form.useForm()

  const [MfaCode, setMFACode] = useState(new Array(CODE_LEN).fill(''))
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    try {
      const user: User = await authClient.mfa.verifyTotpMfa({
        mfaToken,
        totp: MfaCode.join(''),
      })
      onSuccess && onSuccess(user)
    } catch (e) {
      onFail?.(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h3 className="authing-guard-mfa-title">账号登录验证</h3>
      <p className="authing-guard-mfa-tips">
        请输入获取的 6 位数字安全码验证登录
      </p>
      <Form
        form={rawForm}
        onSubmitCapture={() => setLoading(true)}
        onFinish={onFinish}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          name="mfaCode"
          rules={[
            {
              validateTrigger: [],
              validator() {
                if (MfaCode.some((item) => !item)) {
                  return Promise.reject('请输入完整安全码')
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <VerifyCodeInput verifyCode={MfaCode} setVerifyCode={setMFACode} />
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

        <div className="authing-guard-form-actions">
          <div className="authing-guard-tip-btn-comb">
            <span className="authing-guard-tip">安全码丢失？</span>
            <Button
              htmlType="button"
              onClick={goReset}
              className="authing-guard-text-btn"
              type="text"
            >
              使用恢复码
            </Button>
          </div>
        </div>
      </Form>
    </>
  )
}
