import { Button } from 'antd'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaSize } from 'src/components/AuthingGuard/hooks'
import { useGuardContext } from 'src/context/global/context'
import { getClassnames, getOS } from 'src/utils'
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

export const AppDownload: FC<AppDownloadProps> = () => {
  const { isPhoneMedia } = useMediaSize()

  const { t } = useTranslation()

  const {
    state: { config },
  } = useGuardContext()

  const os = getOS()

  const appDownloadConfig = [
    {
      name: 'Google Authenticator',
      imageUrl: 'googleLogo',
      download: () => {
        if (os && Object.keys(download_authenticator_config).includes(os)) {
          // @ts-ignore
          window.open(`${DOWNLOAD_AUTHENTICATOR_CONFIG?.[os].google}`)
        }
      },
      androidQRcode: download_authenticator_config.Android.googleQRcode,
      iOSQRcode: download_authenticator_config.iOS.googleQRcode,
    },
    {
      name: 'Microsoft Authenticator',
      imageUrl: 'microsoftLogo',
      download: () => {
        if (os && Object.keys(download_authenticator_config).includes(os)) {
          // @ts-ignore
          window.open(`${DOWNLOAD_AUTHENTICATOR_CONFIG?.[os]?.microsoft}`)
        }
      },
      androidQRcode: download_authenticator_config.Android.microsoftQRcode,
      iOSQRcode: download_authenticator_config.iOS.microsoftQRcode,
    },
  ]

  return (
    <>
      <div className="authing-guard-bindTotp-media">
        {appDownloadConfig.map((item, index) => (
          <div className="authing-guard-bindTotp-item-medias" key={index}>
            <div className="bindTotp-item-header-medias">
              <img src={item.imageUrl} alt="app logo" />
              <span className="authing-mfa-dowload-item-title">
                {item.name}
              </span>
            </div>
            <Button
              className="btnItem"
              size="large"
              type="primary"
              onClick={item.download}
            >
              {t('common.download')}
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}
