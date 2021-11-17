import { Row, Col } from 'antd'
import Input, { InputProps } from 'antd/lib/input'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePro } from '../../../ImagePro'

export interface GraphicVerifyCodeProps extends InputProps {
  verifyCodeUrl: string
  changeCode: () => void
}

export const GraphicVerifyCode: React.FC<GraphicVerifyCodeProps> = (props) => {
  const { verifyCodeUrl, changeCode, ...inputProps } = props

  const { t } = useTranslation()

  return (
    <div className="g2-graphic-verify-code">
      <Input {...inputProps} />

      <ImagePro
        className="g2-captcha-code-image"
        src={verifyCodeUrl}
        alt={t('login.captchaCode')}
        height="46px"
        style={{ cursor: 'pointer' }}
        onClick={() => changeCode()}
      />
    </div>
  )
}
