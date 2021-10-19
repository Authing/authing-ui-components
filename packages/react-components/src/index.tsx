import React from 'react'
import ReactDOM from 'react-dom'

import { Guard } from './components/Guard'
import { AuthingGuard } from './components/AuthingGuard'
import reportWebVitals from './reportWebVitals'
import { message } from 'antd'
import { LoginMethods, RegisterMethods } from './components'

const App = () => {
  return (
    <div>
      <Guard
        appId="610271b10cd9106606c73d57"
        onLogin={(u) => message.info('🏁 用户业务层终点，登录完成。')}
        onBeforeLogin={(loginInfo, authClient) => {
          console.log('🪝loginInfo 被用户消费，返回 promise 或布尔', loginInfo)
          return new Promise((resolve) => {
            resolve(true)
          })
        }}
        onLoginError={() => {
          console.log('❌ 业务事件，error')
        }}
        onLoginTabChange={(key) => {
          console.log('📁 业务事件，tab change', key)
        }}
        onRegisterTabChange={(registerMethod) => {
          console.log('📁 业务事件，tab change', registerMethod)
        }}
        config={{
          // autoRegister: false,
          defaultRegisterMethod: RegisterMethods.Phone,
          // disableRegister: true,
          // disableResetPwd: true,
          // loginMethods: [],
          loginMethods: [
            LoginMethods.Password,
            // LoginMethods.PhoneCode,
            // LoginMethods.WxMinQr,
          ], //
          // defaultLoginMethod: LoginMethods.WxMinQr, // 指定默认登录方式，如果这个方式不存在于 LoginMethods，那么就当作没有传入
          // qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
          // passwordLoginMethods?: PasswordLoginMethods[]
          // socialConnections?: SocialConnectionProvider[]
          // enterpriseConnections?: string[]
          // disableResetPwd?: boolean
          // publicKey?: string
        }}
      />

      <AuthingGuard
        appId="610271b10cd9106606c73d57"
        // appId="6167e1e3f19080f1bf7b7797"
        config={
          {
            // disableRegister: true,
            // disableResetPwd: true,
            // autoRegister: true,
            // loginMethods: [],
            // loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
          }
        }
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
