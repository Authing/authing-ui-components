import React from 'react'
import ReactDOM from 'react-dom'

import { Guard } from './components/Guard'
import { AuthingGuard } from './components/AuthingGuard'
import reportWebVitals from './reportWebVitals'
import { LoginMethods } from 'authing-js-sdk'

const App = () => {
  return (
    <div>
      <Guard appId="60c02a89a9e0431e271d9ff0" />
      {/* LDAP = 'ldap',
  AppQr = 'app-qrcode',
  Password = 'password',
  PhoneCode = 'phone-code',
  WxMinQr = 'wechat-miniprogram-qrcode', // 对应社会化登录的 wechat:miniprogram:qrconnect(小程序扫码登录)
  AD = 'ad', // 对应企业身份源的 Windows AD 登录
  WechatMpQrcode = 'wechatmp-qrcode', // 微信扫码关注登录 */}

      <AuthingGuard
        appId="60c02a89a9e0431e271d9ff0"
        config={{
          loginMethods: [LoginMethods.Password, LoginMethods.LDAP],
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
