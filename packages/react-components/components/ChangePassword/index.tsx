import { message } from 'antd'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GuardModuleType } from '../Guard/module'
import { ImagePro } from '../ImagePro'
import { FirstLoginReset } from './core/firstLoginReset'
import { RotateReset } from './core/rotateReset'

// 手动修改密码，并非「忘记密码」
// 进入的场景是读取配置：1开了首次登录修改密码 || 2开了密码轮换
export const GuardChangePassword = (props: any) => {
  let { initData, config } = props
  let publicConfig = config.__publicConfig__
  const { t } = useTranslation()

  const onReset = (res: any) => {
    let code = res.code
    if (code === 200) {
      message.success(t('common.updatePsswordSuccess'))
      // 返回登录
      setTimeout(() => {
        props.__changeModule(GuardModuleType.LOGIN)
      }, 500)
    } else {
      console.log('*** reset code no catched', res)
    }
  }

  const typeContent = useMemo(() => {
    if (initData.type === 'inital') {
      return {
        title: `${t('common.welcome')} ${config.title}`,
        explain: t('common.initPasswordText'),
      }
    } else {
      return {
        title: t('user.modifyPwd'),
        explain: t('user.modifyPwdText', {
          number: 1,
        }),
      }
    }
  }, [config.title, initData.type, t])

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
        <div className="title">{typeContent.title}</div>
        <div className="title-explain">{typeContent.explain}</div>
      </div>
      <div className="g2-view-tabs">
        {initData.type === 'inital' && (
          <FirstLoginReset
            onReset={onReset}
            initData={initData}
            publicConfig={publicConfig}
          />
        )}
        {initData.type === 'rotate' && (
          <RotateReset
            onReset={onReset}
            initData={initData}
            publicConfig={publicConfig}
          />
        )}
      </div>
    </div>
  )
}
