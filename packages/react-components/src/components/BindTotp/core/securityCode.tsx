import React from 'react'
import { useAsyncFn } from 'react-use'
import { useGuardHttp } from 'src/utils/guradHttp'

export interface SecurityCodeProps {
  mfaToken: string
}

export const SecurityCode: React.FC<SecurityCodeProps> = () => {
  const { post } = useGuardHttp()

  useAsyncFn(async () => {
    await post('/api/v2/mfa/totp/associate', {})
  })
  return (
    <>
      <p className="authing-g2-mfa-title">MFA 绑定</p>
      <p className="authing-g2-mfa-tips">
        请在手机打开 Google Authenticator / Microsoft
        Authenticator（没有验证器请 点击下载） 扫码添加 MFA，在手机查看并输入 6
        位数字安全码。
      </p>
    </>
  )
}
