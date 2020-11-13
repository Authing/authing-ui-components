import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { AuthingGuard } from './components/AuthingGuard'
import {
  GuardMode,
  UserConfig,
  // LoginMethods,
  // RegisterMethods,
  // GuardScenes,
  // SocialConnections,
} from './components/AuthingGuard/types/GuardConfig'
import reportWebVitals from './reportWebVitals'

const App = () => {
  const config: UserConfig = {
    apiHost: 'http://console.authing.localhost:3000',
    // loginMethods: Object.values(LoginMethods),
    logo:
      'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
    title: 'Authing',
    // defaultLoginMethod: LoginMethods.LDAP,
    // registerMethods: Object.values(RegisterMethods),
    // defaultRegisterMethod: RegisterMethods.Email,
    // defaultScenes: GuardScenes.Login,
    // socialConnections: Object.values(SocialConnections),
    // enterpriseConnections: ["oidc1"],
    appId: '5fa5053e252697ad5302ce7e',
    mode: GuardMode.Modal,
    // autoRegister: true,
  }
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 3000)
  }, [])

  return (
    // eslint-disable-next-line react/jsx-no-undef
    <AuthingGuard
      visible={visible}
      onClose={() => {
        setVisible(false)
      }}
      onLoad={(a) => console.log(a)}
      // onPwdResetError={(e) => console.log(e)}
      userPoolId="59f86b4832eb28071bdd9214"
      config={config}
    />
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
