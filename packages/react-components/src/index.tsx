import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { initAuthClient, useAuthing } from './components'
import { AuthingGuard } from './components/AuthingGuard'

import {
  GuardMode,
  LoginMethods,
  SocialConnections,
  UserConfig,
  // LoginMethods,
  // RegisterMethods,
  // GuardScenes,
  // SocialConnections,
} from './components/AuthingGuard/types/GuardConfig'
import reportWebVitals from './reportWebVitals'

const App = () => {
  const config: UserConfig = {
    mode: GuardMode.Modal,
    // apiHost: 'http://console.authing.localhost:3000',
    // apiHost: 'http://192.168.50.57:3000',
    // loginMethods: Object.values(LoginMethods),
    // logo:
    //   'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
    // title: 'Authing',
    // defaultLoginMethod: LoginMethods.LDAP,
    // registerMethods: Object.values(RegisterMethods),
    // defaultRegisterMethod: RegisterMethods.Email,
    // defaultScenes: GuardScenes.Login,
    // socialConnections: Object.values(SocialConnections),
    // enterpriseConnections: ["oidc1"],
    // appDomain: 'oidc1.authing.cn',
    // appId: '5f17a529f64fb009b794a2ff',
    // isSSO: true,
    // zIndex: 300,
    // text: {
    //   loginTabs: {
    //     [LoginMethods.Password]: '密码登录一下',
    //   },
    //   loginBtn: {
    //     loading: 'fuck',
    //   },
    // },
    // mode: GuardMode.Modal,
    // contentCss: `
    //   html, body {
    //     background-color: #fff;
    //   }
    // `,
    // autoRegister: true,
    socialConnections: [SocialConnections.AppleWeb],
  }
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 3000)
  }, [])

  initAuthClient({
    appId: '60053b7416478de2e88fab43',
  })

  return (
    // eslint-disable-next-line react/jsx-no-undef
    <>
      <AuthingGuard
        // visible={visible}
        // onLoginTabChange={(v) => console.log(v)}
        // onRegisterTabChange={(v) => console.log(v)}
        // onClose={() => {
        //   setVisible(false)
        //   setTimeout(() => {
        //     setVisible(true)
        //   }, 2000)
        // }}
        // onLoad={(a) => console.log(a, '加载完成')}
        // onPwdResetError={(e) => console.log(e)}
        appId="60053b7416478de2e88fab43"
        // appId="5fd877fb0ba0421962eced94"
        config={config}
      />
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
