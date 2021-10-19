import React, { FC } from 'react'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../../../IconFont'
import './styles.less'
import { getOS } from '../../../../../utils'

export interface AppDownloadProps {}

export const download_authenticator_config = {
  Android: {
    google:
      'https://authing-public-cn.oss-cn-beijing.aliyuncs.com/public/Google%20Authenticator.apk',
    microsoft: 'https://mobile.baidu.com/item?docid=27175919',
    googleQRcode:
      'https://files.authing.co/authing-user-portal/GoogleAuthenticator-Authing.png',
    microsoftQRcode:
      'https://files.authing.co/authing-user-portal/MicrosoftAuthenticator-Baidu.png',
  },
  iOS: {
    google: 'https://apps.apple.com/us/app/google-authenticator/id388497605',
    microsoft:
      'https://apps.apple.com/us/app/microsoft-authenticator/id983156458',
    googleQRcode:
      'https://files.authing.co/authing-user-portal/GoogleAuthenticator-Apple.png',
    microsoftQRcode:
      'https://files.authing.co/authing-user-portal/MicrosoftAuthenticator-Apple.png',
  },
}

const GoogleApple = download_authenticator_config.iOS.googleQRcode
const MicrosoftApple = download_authenticator_config.iOS.microsoftQRcode
const GoogleAuthing = download_authenticator_config.Android.googleQRcode
const MicrosoftBaidu = download_authenticator_config.Android.microsoftQRcode

export const AppDownload: FC<AppDownloadProps> = () => {
  const { t } = useTranslation()

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

export const DOWNLOAD_AUTHENTICATOR_CONFIG = {
  Android: {
    google:
      'https://authing-public-cn.oss-cn-beijing.aliyuncs.com/public/Google%20Authenticator.apk',
    microsoft: 'https://mobile.baidu.com/item?docid=27175919',
  },
  iOS: {
    google: 'https://apps.apple.com/us/app/google-authenticator/id388497605',
    microsoft:
      'https://apps.apple.com/us/app/microsoft-authenticator/id983156458',
  },
}

export const MediaAppDownload: FC = () => {
  const { t } = useTranslation()
  const os = getOS()

  const appDownloadConfig = [
    {
      name: 'Google Authenticator',
      imageUrl:
        'https://files.authing.co/authing-user-portal/logo-google%402x.png',
      download: () => {
        if (os && Object.keys(DOWNLOAD_AUTHENTICATOR_CONFIG).includes(os)) {
          // @ts-ignore
          window.open(`${DOWNLOAD_AUTHENTICATOR_CONFIG?.[os as never].google}`)
        }
      },
    },
    {
      name: 'Microsoft Authenticator',
      imageUrl:
        'https://files.authing.co/authing-user-portal/logo-microsoft%402x.png',
      download: () => {
        if (os && Object.keys(DOWNLOAD_AUTHENTICATOR_CONFIG).includes(os)) {
          window.open(
            // @ts-ignore
            `${DOWNLOAD_AUTHENTICATOR_CONFIG?.[os as never].microsoft}`
          )
        }
      },
    },
  ]

  return (
    <div className={'mediaAppDownload'}>
      {appDownloadConfig.map((item, index) => (
        <div className={'mediaAppDownloadItem'} key={index}>
          <div className={'itemHeader'}>
            <img src={item.imageUrl} alt="app logo" />
            <span className="authing-mfa-dowload-item-title">{item.name}</span>
            <span className=""></span>
          </div>
          <Button
            className={'btnItem'}
            size="large"
            type="primary"
            onClick={item.download}
          >
            {t('common.download')}
          </Button>
        </div>
      ))}
    </div>
  )
}
