import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getOS } from 'src/utils'
import { IconFont } from '../../../IconFont'
import './styles.less'

export interface AppDownloadProps {}

export const download_authenticator_config = {
  Android: {
    google:
      'https://authing-public-cn.oss-cn-beijing.aliyuncs.com/public/Google%20Authenticator.apk',
    microsoft: 'https://mobile.baidu.com/item?docid=27175919',
    googleQRcode: '/GoogleAuthenticator-Authing.png',
    microsoftQRcode: '/MicrosoftAuthenticator-Baidu.png',
  },
  iOS: {
    google: 'https://apps.apple.com/us/app/google-authenticator/id388497605',
    microsoft:
      'https://apps.apple.com/us/app/microsoft-authenticator/id983156458',
    googleQRcode: '/GoogleAuthenticator-Apple.png',
    microsoftQRcode: '/MicrosoftAuthenticator-Apple.png',
  },
}

const GoogleApple = download_authenticator_config.iOS.googleQRcode
const MicrosoftApple = download_authenticator_config.iOS.microsoftQRcode
const GoogleAuthing = download_authenticator_config.Android.googleQRcode
const MicrosoftBaidu = download_authenticator_config.Android.microsoftQRcode

export const AppDownload: FC<AppDownloadProps> = () => {
  const { t } = useTranslation()

  const os = getOS()

  return (
    <div className="appDownload">
      <div className="item">
        <div
          className="logo"
          style={{
            background: '#EFF2F6',
          }}
        >
          <IconFont
            type="authing-apple-web"
            style={{
              fontSize: 30,
              color: '#293350',
            }}
          />
        </div>
        <span className="title">{t('common.downloadTotpAppIOS')}</span>
        <span className="subtitle">{t('common.downloadTotpAppDocs')}</span>
        <div className="QRCode">
          <div className="QRCodeItem">
            <div
              className="image"
              style={{
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('${GoogleApple}')`,
              }}
            />
            <span className="QRCodeText">Google Authenticator</span>
          </div>
          <div className="QRCodeItem">
            <div
              className="image"
              style={{
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('${MicrosoftApple}')`,
              }}
            />
            <span className="QRCodeText">Microsoft Authenticator</span>
          </div>
        </div>
      </div>
      <div className="item">
        <div
          className="logo"
          style={{
            background: '#28B1B0',
          }}
        >
          <IconFont
            type="authing-anzhuo"
            style={{
              fontSize: 30,
              color: '#FFF',
            }}
          />
        </div>
        <span className="title">{t('common.downloadTotpAppAndroid')}</span>
        <span className="subtitle">{t('common.downloadTotpAppDocs')}</span>
        <div className="QRCode">
          <div className="QRCodeItem">
            <div
              className="image"
              style={{
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('${GoogleAuthing}')`,
              }}
            />
            <span className="QRCodeText">Google Authenticator</span>
          </div>
          <div className="QRCodeItem">
            <div
              className="image"
              style={{
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('${MicrosoftBaidu}')`,
              }}
            />
            <span className="QRCodeText">Microsoft Authenticator</span>
          </div>
        </div>
      </div>
    </div>
  )
}
