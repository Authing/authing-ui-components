import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../../../IconFont'
import CopyIcon from './CopyIcon'

export const ScanQrcode: FC<{
  qrcode: string
  secret: string
  isPhoneMedia: boolean
  userpoolName: string
}> = ({ qrcode, secret, isPhoneMedia, userpoolName }) => {
  const { t } = useTranslation()

  const desc = useMemo(
    () =>
      isPhoneMedia
        ? t('user.pleaseDownloadAuthenticatorMedia')
        : t('user.pleaseDownloadAuthenticator'),
    [t, isPhoneMedia]
  )

  return (
    <div className="ScanQrcode">
      {!isPhoneMedia ? (
        <>
          <h4 className="subtitle">{t('user.scanQrcode')}</h4>
          <p className="desc">{desc}</p>
          <img className="qrcode" src={qrcode} alt="qrcode" />
        </>
      ) : (
        <>
          <h4 className="subtitle">{t('user.saveSecret')}</h4>
          <div className="secretInput">
            <div className="iconBox">
              <IconFont type="authing-key-2-line" />
            </div>
            {t('common.secret')}: {secret}
            <CopyIcon copyValue={secret} style={{ marginLeft: 'auto' }} />
          </div>
        </>
      )}
    </div>
  )
}
