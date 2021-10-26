import React from 'react'
import { ImagePro } from 'src/common/ImagePro'
import { GuardModuleType } from '../Guard/module'

import { CompleteInfo } from './core/completeInfo'
import { GuardCompleteInfoViewProps } from './props'

export const GuardCompleteInfoView: React.FC<GuardCompleteInfoViewProps> = ({
  config,
  onRegisterInfoCompleted,
  onRegisterInfoCompletedError,
  __changeModule,
}) => {
  return (
    <div className="g2-view-container">
      <div className="g2-view-header">
        <ImagePro
          src={config?.logo}
          size={48}
          borderRadius={4}
          alt=""
          className="icon"
        />
        <div className="title">完善账号信息</div>
        <div className="title-explain">
          {`欢迎加入 ${config.title} ，为了更好的使用体验，请先完善您的资料信息。`}
        </div>
      </div>
      <div className="g2-view-tabs">
        <CompleteInfo
          extendsFields={config?.__publicConfig__?.extendsFields!}
          onRegisterInfoCompleted={(user, udfs, authClient) => {
            onRegisterInfoCompleted?.(user, udfs, authClient)
            __changeModule?.(GuardModuleType.LOGIN, {})
          }}
          onRegisterInfoCompletedError={onRegisterInfoCompletedError}
        />
      </div>
    </div>
  )
}
