import React from 'react'
import { ErrorInitData } from './interface'
import { i18n } from '../_utils/locales'
import './styles.less'
import { IconFont } from '../IconFont'
import { useGuardInitData } from '../_utils/context'

export const GuardErrorView: React.FC = () => {
  const { error } = useGuardInitData<ErrorInitData>()

  const messages = error?.message
    ? `${error?.message} `
    : `${i18n.t('user.contactAdministrator')}`

  return (
    <div className="g2-view-container g2-view-error">
      <div className="g2-error-content">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IconFont type="authing-bianzu" style={{ width: 240, height: 160 }} />
        </div>
        <div className="g2-error-message">{i18n.t('user.error')}</div>
        <span
          className="g2-error-message-text"
          dangerouslySetInnerHTML={{ __html: messages }}
        />
      </div>
    </div>
  )
}
