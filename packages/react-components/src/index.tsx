import React from 'react'
import ReactDOM from 'react-dom'

import { Guard } from './components/Guard'
import { AuthingGuard } from './components/AuthingGuard'
import reportWebVitals from './reportWebVitals'
import { message } from 'antd'
import { RegisterMethods } from './components'

const App = () => {
  return (
    <div>
      <Guard
        appId="610271b10cd9106606c73d57"
        onLogin={(u) => message.info('🏁 用户业务层终点，登录完成。')}
        onBeforeLogin={(loginInfo, authClient) => {
          console.log('🪝loginInfo 被用户消费，返回 promise 或布尔', loginInfo)
          return new Promise((resolve) => {
            resolve(false)
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
          autoRegister: true,
          defaultRegisterMethod: RegisterMethods.Phone,
          // loginMethods?: LoginMethods[]
          // defaultLoginMethod?: LoginMethods
          // socialConnections?: SocialConnectionProvider[]
          // passwordLoginMethods?: PasswordLoginMethods[]
          // enterpriseConnections?: string[]
          // disableResetPwd?: boolean
          // qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
          // publicKey?: string
        }}
      />

      <AuthingGuard
        appId="6167e1e3f19080f1bf7b7797"
        // config={{
        //   loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
        // }}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
