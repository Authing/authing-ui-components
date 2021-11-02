import React from 'react'
import { GuardModuleType } from '../Guard/module'
import { ImagePro } from '../ImagePro'
import { FirstLoginReset } from './core/firstLoginReset'
import { RotateReset } from './core/rotateReset'

// 手动修改密码，并非「忘记密码」
// 进入的场景是读取配置：1开了首次登录修改密码 || 2开了密码轮换
export const GuardChangePassword = (props: any) => {
  let { initData, config } = props
  let publicConfig = config.__publicConfig__
  // let [resetType] = useState<'inital' | 'rotate'>(initData.type) //
  // console.log('******', initData.type)
  // let publicConfig = props.config.__publicConfig__

  const onReset = (res: any) => {
    let code = res.code
    if (code === 200) {
      // 返回登录
      props.__changeModule(GuardModuleType.LOGIN)
    } else {
      console.log('*** reset code no catched', res)
    }
  }

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
        <div className="title">欢迎访问 {config.title}</div>
        <div className="title-explain">
          你的密码连续使用超过 xxx，可能存在风险。请重新设置密码。
        </div>
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
