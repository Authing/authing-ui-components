import { Tabs } from 'antd'
import React, { ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../IconFont'
import { MFAType } from '../MFA/props'
import { GuardDownloadATViewProps } from './props'
import './styles.less'

enum DownloadType {
  IOS = 'ios',
  Android = 'Android',
}

export const GuardDownloadATView: React.FC<GuardDownloadATViewProps> = ({
  config,
  __back,
}) => {
  const { t } = useTranslation()

  const cdnBase = config.__publicConfig__?.cdnBase

  const downloadConfig: Record<DownloadType, any> = useMemo(
    () => ({
      [DownloadType.IOS]: {
        title: t('common.downloadTotpAppIOS'),
        google: `${cdnBase}/GoogleAuthenticator-Apple.png`,
        microsoft: `${cdnBase}/MicrosoftAuthenticator-Apple.png`,
      },
      [DownloadType.Android]: {
        title: t('common.downloadTotpAppAndroid'),
        google: `${cdnBase}/GoogleAuthenticator-Authing.png`,
        microsoft: `${cdnBase}/MicrosoftAuthenticator-Baidu.png`,
      },
    }),
    [cdnBase, t]
  )

  const renderTab = useMemo(
    () =>
      (Object.keys(downloadConfig) as DownloadType[]).map<ReactNode>(
        (value: DownloadType, index: number) => (
          <Tabs.TabPane
            tab={downloadConfig[value].title}
            key={index}
            className="g2-mfa-download-at-tab"
          >
            <span className="g2-mfa-totp-download-subtitle">
              {t('common.downloadTotpAppDocs')}
            </span>
            <div className="g2-mfa-totp-download-qrcode">
              <div className="g2-mfa-totp-download-qrcode-item">
                <img
                  className="g2-mfa-totp-download-image"
                  src={downloadConfig[value].google}
                  alt="Google Authenticator"
                />
                <span className="g2-mfa-totp-download-qrcode-text">
                  Google Authenticator
                </span>
              </div>
              <div className="g2-mfa-totp-download-qrcode-item">
                <img
                  className="g2-mfa-totp-download-image"
                  src={downloadConfig[value].microsoft}
                  alt="Microsoft Authenticator"
                />
                <span className="g2-mfa-totp-download-qrcode-text">
                  Microsoft Authenticator
                </span>
              </div>
            </div>
          </Tabs.TabPane>
        )
      ),
    [downloadConfig, t]
  )

  const onBack = () => __back?.()

  return (
    <div className="g2-view-container">
      <div className="g2-view-back">
        <span onClick={onBack}>
          <IconFont type="authing-back" />
          <span>返回 MFA 绑定</span>
        </span>
      </div>
      <div className="g2-view-tabs g2-mfa-totp-download-tabs">
        <Tabs defaultActiveKey={DownloadType.IOS}>{renderTab}</Tabs>
      </div>
    </div>
  )
}
