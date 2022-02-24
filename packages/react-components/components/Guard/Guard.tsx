import React from 'react'
import { ConfigProvider, message, Modal } from 'antd'
import { GuardEvents } from './event'
import { i18n } from '..//_utils/locales'
import { IG2FCProps } from '../Type'
import { GuardLocalConfig } from './config'
import { GuardModuleType } from './module'
import './styles.less'
import { IconFont } from '../AuthingGuard/IconFont'
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import 'moment/locale/zh-cn'
import { useGuardCore } from './core'
import { GuardMode } from '..'

const PREFIX_CLS = 'authing-ant'
export enum LangMAP {
  zhCn = 'zh-CN',
  enUs = 'en-US',
}

const langMap = {
  [LangMAP.zhCn]: zhCN,
  [LangMAP.enUs]: enUS,
}

message.config({
  prefixCls: `${PREFIX_CLS}-message`,
})
export interface GuardProps extends GuardEvents, IG2FCProps {
  tenantId?: string
  config?: Partial<GuardLocalConfig>
  visible?: boolean
}

interface ModuleState {
  moduleName: GuardModuleType
  initData: any
}

export const Guard = (props: GuardProps) => {
  const { config } = props

  // 首页 init 数据
  const initState: ModuleState = {
    moduleName: config?.defaultScenes ?? GuardModuleType.LOGIN,
    initData: config?.defaultInitData ?? {},
  }

  const { renderModule } = useGuardCore(props, initState)

  return (
    <ConfigProvider
      prefixCls={PREFIX_CLS}
      locale={langMap[i18n.language as LangMAP]}
    >
      {config?.mode === GuardMode.Modal ? (
        <Modal
          className="authing-g2-render-module-modal"
          closeIcon={
            <IconFont type="authing-close-line" className="g2-modal-close" />
          }
          visible={props.visible}
          onCancel={props.onClose}
          keyboard={config.escCloseable}
          maskClosable={false} // 点击蒙层，是否允许关闭
          getContainer={config.target ? config.target : false}
        >
          <div className="authing-g2-render-module">{renderModule}</div>
        </Modal>
      ) : (
        <div className="authing-g2-render-module">{renderModule}</div>
      )}
    </ConfigProvider>
  )
}
