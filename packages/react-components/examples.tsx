import React from 'react'
import ReactDOM from 'react-dom'

import reportWebVitals from './reportWebVitals'
import { message } from 'antd'
import { Guard } from './components'

const App = () => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        justifyContent: 'center',
        WebkitUserSelect: 'none',
      }}
    >
      <Guard
        appId="61a9bad738edd8f1dd9fe1cc"
        // appId="6191cf610f772aa56dc70637"
        // tenantId="6194a41abf23c1d5268b362a1"
        onLogin={(u) => {
          message.info('🏁 用户业务层终点，登录完成。')
          console.log(u)
        }}
        onLoad={(authClint) => console.log('🪝 onLoad', authClint)}
        onLoadError={(error) => console.log('🪝 onLoadError', error)}
        onBeforeLogin={(m) => {
          console.log('🪝onBeforeLogin 触发，返回 promise 或布尔', m)
          return new Promise((resolve) => {
            resolve(true)
          })
        }}
        onRegister={(user, authClint) => {
          console.log('🪝 onRegister 触发', user, authClint)
        }}
        onRegisterError={(e) => console.log('🪝 onRegisterError 触发', e)}
        onLoginError={() => {
          console.log('❌ onLoginError 触发')
        }}
        onLoginTabChange={(key) => {
          console.log('📁 onLoginTabChange 触发', key)
        }}
        onRegisterTabChange={(registerMethod) => {
          console.log('📁 onRegisterTabChange 触发', registerMethod)
        }}
        config={{
          // host: 'https://core.dev2.authing-inc.co/',
          host: 'http://core.authing.localhost:3000/',
          // registerMethods: [RegisterMethods.Email],
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
          // socialConnections: [
          //   SocialConnectionProvider.ALIPAY,
          //   SocialConnectionProvider.APPLE_WEB,
          // ], // 指定可选的社会化登录方式
          // qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
          // passwordLoginMethods?: PasswordLoginMethods[]
          // enterpriseConnections: [] // 这个有啥用？
          // publicKey?: string
          // lang: 'en-US',
          // lang: 'zh-CN',
          // mode: GuardMode.Modal,
          // logo: '',
          // clickCloseable: false, // clickCloseable	Modal 模式时是否隐藏登录框右上角的关闭按钮
          // escCloseable: true, //
          // target: '#c1',
          // socialConnectionsBtnShape: 'rectangle',
        }}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
