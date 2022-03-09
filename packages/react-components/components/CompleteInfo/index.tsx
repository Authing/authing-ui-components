import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePro } from '../ImagePro'
import { GuardModuleType } from '../Guard/module'
import { CompleteInfo } from './core/completeInfo'
import {
  CompleteInfoBaseControls,
  CompleteInfoExtendsControls,
  FormValidateRule,
} from './interface'
import './styles.less'
import { IconFont } from '../IconFont'
import { useGuardAuthClient } from '../Guard/authClient'
import {
  useGuardEvents,
  useGuardFinallyConfig,
  useGuardInitData,
  useGuardModule,
  useGuardPublicConfig,
} from '../_utils/context'

export const GuardCompleteInfoView: React.FC = () => {
  const config = useGuardFinallyConfig()

  const events = useGuardEvents()

  const initData = useGuardInitData<any>()

  const { changeModule } = useGuardModule()

  const { t } = useTranslation()

  const authClient = useGuardAuthClient()

  const user = initData.user

  const publicConfig = useGuardPublicConfig()

  const skipComplateFileds = publicConfig?.skipComplateFileds ?? false

  const onSuccess = (
    udfs: {
      definition: any
      value: any
    }[]
  ) => {
    events?.onRegisterInfoCompleted?.(user, udfs, authClient)
    if (initData.context === 'register') {
      changeModule?.(GuardModuleType.LOGIN, {})
    } else {
      events?.onLogin?.(user, authClient)
    }
  }

  const metaData = useMemo(
    () => [
      {
        type: CompleteInfoExtendsControls.SELECT,
        name: 'name1',
        label: 'name1',
        required: false,
        validateRules: [],
        options: [
          {
            label: '2222',
            value: '111',
          },
        ],
      },
      {
        type: CompleteInfoBaseControls.PHONE,
        name: 'phone',
        label: '手机号',
        required: false,
        validateRules: [
          {
            type: FormValidateRule.PHONE,
            content: '',
          },
        ],
      },
      {
        type: CompleteInfoExtendsControls.TEXT,
        name: 'name2',
        label: 'name2',
        required: true,
        validateRules: [
          {
            type: FormValidateRule.REG_EXP,
            content: '/^1[3-9]\\d{9}$/',
            errorMessages: '这个好像不是我的名字',
          },
        ],
      },
      {
        type: CompleteInfoBaseControls.EMAIL,
        name: 'email',
        label: '邮箱',
        required: false,
        validateRules: [
          {
            type: FormValidateRule.EMAIL,
            content: '',
          },
        ],
      },
    ],
    []
  )

  return (
    <div className="g2-view-container g2-complete-info">
      <div className="g2-view-header">
        <div className="g2-completeInfo-header">
          <ImagePro
            src={config?.logo!}
            size={48}
            borderRadius={4}
            alt=""
            className="icon"
          />

          {skipComplateFileds && (
            <span
              className="g2-completeInfo-header-skip"
              onClick={() => onSuccess([])}
            >
              <IconFont type="authing-a-share-forward-line1" />
              <span>{t('common.skip')}</span>
            </span>
          )}
        </div>

        <div className="title">{t('common.perfectUserInfo')}</div>
        <div className="title-explain">
          {t('common.welcomeDoc', { name: config.title })}
        </div>
      </div>
      <div className="g2-view-tabs g2-completeInfo-content">
        <CompleteInfo
          metaData={metaData}
          onRegisterInfoCompleted={(_, udfs) => {
            onSuccess(udfs)
          }}
          onRegisterInfoCompletedError={events?.onRegisterInfoCompletedError}
        />
      </div>
    </div>
  )
}
