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
      <h4 className="subtitle">{t('user.scanQrcode')}</h4>
      <p className="desc">{desc}</p>

      {!isPhoneMedia ? (
        <img className="qrcode" src={qrcode} alt="qrcode" />
      ) : (
        <>
          <div className="secretInput">
            <div className="iconBox">
              <IconFont type="authing-key-2-line" />
            </div>
            {t('common._ appellation')}: {userpoolName}
            <CopyIcon
              copyValue={userpoolName!}
              style={{ marginLeft: 'auto' }}
            />
          </div>
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
