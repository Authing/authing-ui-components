import { User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'
import { Button, Form } from 'antd'

import { VerifyCodeInput } from '../../../../common/VerifyCodeInput'
import { useGuardContext } from '../../../../context/global/context'
import { MfaVerifyForm } from '../../../../components/AuthingGuard/types'

import './style.less'
import { useTranslation } from 'react-i18next'

const CODE_LEN = 6

export const MFAVerifyForm: FC<MfaVerifyForm> = ({
  onSuccess,
  onFail,
  goReset,
}) => {
  const {
    state: {
      authClient,
      mfaData: { mfaToken },
    },
  } = useGuardContext()

  const { t } = useTranslation()

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
      <h3 className="authing-guard-mfa-title">
        {t('login.accPwdLoginVerify')}
      </h3>
      <p className="authing-guard-mfa-tips">{t('login.inputSixCode')}</p>
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
                  return Promise.reject(t('login.inputFullMfaCode'))
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
          {t('common.sure')}
        </Button>

        <div className="authing-guard-form-actions">
          <div className="authing-guard-tip-btn-comb">
            <span className="authing-guard-tip">
              {t('common.hasLooseSaftyCode')}
            </span>
            <Button
              htmlType="button"
              onClick={goReset}
              className="authing-guard-text-btn"
              type="text"
            >
              {t('common.useRecoverCode')}
            </Button>
          </div>
        </div>
      </Form>
    </>
  )
}
