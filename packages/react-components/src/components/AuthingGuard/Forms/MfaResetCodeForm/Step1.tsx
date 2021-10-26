import { Input, Form, Button } from 'antd'
import React, { FC, useState } from 'react'
import { LockOutlined } from '@ant-design/icons'
import { getRequiredRules } from '../../../_utils'
import { useGuardContext } from '../../../context/global/context'
import { User } from 'authing-js-sdk'
import { useTranslation } from 'react-i18next'

export const MfaResetStep1: FC<{
  mfaToken: string
  onSuccess: (
    user: User & {
      recoveryCode: string
    }
  ) => void
  goVerify: () => void
  onFail?: (error: any) => void
}> = ({ mfaToken, onSuccess, goVerify, onFail }) => {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const {
    state: { authClient },
  } = useGuardContext()

  const onFinish = async (values: any) => {
    try {
      const user = await authClient.mfa.verifyTotpRecoveryCode({
        recoveryCode: values.recoverCode,
        mfaToken,
      })
      onSuccess(
        user as User & {
          recoveryCode: string
        }
      )
    } catch (e) {
      onFail?.(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      onSubmitCapture={() => setLoading(true)}
      onFinishFailed={() => setLoading(false)}
      onFinish={onFinish}
    >
      <Form.Item
        rules={getRequiredRules(t('common.recoverCodeNotNull'))}
        name="recoverCode"
      >
        <Input
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
          placeholder={t('login.inputRecoverCode')}
          size="large"
        ></Input>
      </Form.Item>

      <Button
        className="authing-guard-mfa-confirm-btn"
        loading={loading}
        htmlType="submit"
        block
        type="primary"
        size="large"
      >
        {t('common.sure')}
      </Button>

      <div className="authing-guard-form-actions">
        <div className="authing-guard-tip-btn-comb">
          <Button
            htmlType="button"
            onClick={goVerify}
            className="authing-guard-text-btn"
            type="text"
          >
            {t('login.findedSafetyCode')}
          </Button>
        </div>
      </div>
    </Form>
  )
}
