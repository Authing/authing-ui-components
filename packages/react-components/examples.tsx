import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import reportWebVitals from './reportWebVitals'
import { Button, message } from 'antd'
import { Guard } from './components'

import { GuardMode } from './components/Type'

const App = () => {
  let [visible, setVisible] = useState(true)
  return (
    <div
      style={{
        background: '#f5f7fa',
        height: '90vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div id="c1"></div>
      <Button onClick={() => setVisible(false)}>隐藏</Button>
      <Button onClick={() => setVisible(true)}>开启</Button>

      <Guard
        appId="610271b10cd9106606c73d57"
        onLogin={(u) => message.info('🏁 用户业务层终点，登录完成。')}
        onBeforeLogin={(loginInfo, authClient) => {
          console.log('🪝onBeforeLogin 触发，返回 promise 或布尔', loginInfo)
          return new Promise((resolve) => {
            resolve(true)
          })
        }}
        onLoginError={() => {
          console.log('❌ onLoginError 触发')
        }}
        onLoginTabChange={(key) => {
          console.log('📁 onLoginTabChange 触发', key)
        }}
        onRegisterTabChange={(registerMethod) => {
          console.log('📁 onRegisterTabChange 触发', registerMethod)
        }}
        onClose={() => {
          setVisible(false)
        }}
        visible={visible}
        config={{
          // autoRegister: true,
          // defaultRegisterMethod: RegisterMethods.Phone,
          // disableRegister: false,
          // disableResetPwd: false,
          // defaultLoginMethod: LoginMethods.WxMinQr, // 指定默认登录方式，如果这个方式不存在于 LoginMethods，那么就当作没有传入
          // loginMethods: [],
          // LoginMethods.Password,
          //   LoginMethods.PhoneCode,
          // LoginMethods.WxMinQr,
          // ],
          socialConnections: [
            SocialConnectionProvider.ALIPAY,
            SocialConnectionProvider.APPLE_WEB,
          ], // 指定可选的社会化登录方式
          // qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
          // passwordLoginMethods?: PasswordLoginMethods[]
          // enterpriseConnections: [] // 这个有啥用？
          // publicKey?: string
          lang: 'en-US',
          // lang: 'zh-CN',
          mode: GuardMode.Modal,
          clickCloseable: false, // clickCloseable	Modal 模式时是否隐藏登录框右上角的关闭按钮
          escCloseable: true, //
          target: '#c1',
          socialConnectionsBtnShape: 'rectangle',
        }}
      />

      {/* <AuthingGuard
        appId="610271b10cd9106606c73d57"
        // appId="6167e1e3f19080f1bf7b7797"
        config={
          {
            // lang: 'en-US',
            // disableRegister: true,
            // disableResetPwd: true,
            // autoRegister: true,
            // loginMethods: [],
            // loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
          }
        }
      /> */}
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
