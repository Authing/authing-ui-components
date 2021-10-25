import { Button, Checkbox, Typography } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const { Paragraph } = Typography

export interface BindSuccessProps {
  onBind: any
  secret: string
}

export const BindSuccess: React.FC<BindSuccessProps> = ({ secret, onBind }) => {
  const [isSaved, setIsSaved] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <p className="authing-g2-mfa-title">请妥善保存恢复代码</p>
      <p className="authing-g2-mfa-tips">
        如果您的 MFA 丢失时，您将需要一个恢复代码
      </p>

      <div className="g2-mfa-bindTotp-copySecret">
        <Paragraph copyable>{secret}</Paragraph>
      </div>

      <Checkbox
        className="g2-mfa-bindTotp-secretSave"
        onChange={(evt) => setIsSaved(evt.target.checked)}
        checked={isSaved}
      >
        {t('login.rememberedSecret')}
      </Checkbox>

      <Button
        className="authing-g2-submit-button g2-mfa-submit-button"
        block
        htmlType="submit"
        type="primary"
        size="large"
        disabled={!isSaved}
        onClick={onBind}
      >
        完成绑定
      </Button>
    </>
  )
}
