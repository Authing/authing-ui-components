import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../IconFont'
import { GuardDownloadATViewProps } from './props'
import './styles.less'

export const GuardDownloadATView: React.FC<GuardDownloadATViewProps> = ({
  config,
}) => {
  const { t } = useTranslation()

  const cdnBase = config.__publicConfig__?.cdnBase

  return (
    <div className="g2-view-container g2-view-container-totp-dl">
      <div className="g2-mfa-totp-title">下载验证器</div>
      <div className="g2-mfa-totp-download">
        <div className="g2-mfa-totp-download-item">
          <div className="g2-mfa-totp-download-logo">
            <IconFont type="authing-apple-web" />
          </div>
          <span className="g2-mfa-totp-download-title">
            {t('common.downloadTotpAppIOS')}
          </span>
          <span className="g2-mfa-totp-download-subtitle">
            {t('common.downloadTotpAppDocs')}
          </span>
          <div className="g2-mfa-totp-download-qrcode">
            <div className="g2-mfa-totp-download-qrcode-item">
              <div
                className="g2-mfa-totp-download-image"
                style={{
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: `url(${cdnBase}/GoogleAuthenticator-Apple.png)`,
                }}
              />
              <span className="g2-mfa-totp-download-qrcode-text">
                Google Authenticator
              </span>
            </div>
            <div className="g2-mfa-totp-download-qrcode-item">
              <div
                className="g2-mfa-totp-download-image"
                style={{
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: `url(${cdnBase}/MicrosoftAuthenticator-Apple.png)`,
                }}
              />
              <span className="g2-mfa-totp-download-qrcode-text">
                Microsoft Authenticator
              </span>
            </div>
          </div>
        </div>
        <div className="g2-mfa-totp-download-item">
          <div className="g2-mfa-totp-download-logo">
            <IconFont type="authing-anzhuo" />
          </div>
          <span className="g2-mfa-totp-download-title">
            {t('common.downloadTotpAppAndroid')}
          </span>
          <span className="g2-mfa-totp-download-subtitle">
            {t('common.downloadTotpAppDocs')}
          </span>
          <div className="g2-mfa-totp-download-qrcode">
            <div className="g2-mfa-totp-download-qrcode-item">
              <div
                className="g2-mfa-totp-download-image"
                style={{
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: `url(${cdnBase}/GoogleAuthenticator-Authing.png)`,
                }}
              />
              <span className="g2-mfa-totp-download-qrcode-text">
                Google Authenticator
              </span>
            </div>
            <div className="g2-mfa-totp-download-qrcode-item">
              <div
                className="g2-mfa-totp-download-image"
                style={{
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundImage: `url(${cdnBase}/MicrosoftAuthenticator-Baidu.png)`,
                }}
              />
              <span className="g2-mfa-totp-download-qrcode-text">
                Microsoft Authenticator
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
