import React from 'react'
import ReactDOM from 'react-dom'
// import { AuthingGuard } from './components/AuthingGuard'
import {
  UserConfig,
  LoginMethods,
  RegisterMethods,
  GuardScenes,
  SocialConnections,
} from './components/AuthingGuard/types/GuardConfig'
import reportWebVitals from './reportWebVitals'
const fuck = require('./fuck')
const { AuthingGuard } = fuck
console.log(fuck)
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
    defaultScenes: GuardScenes.Login,
    // socialConnections: Object.values(SocialConnections),
    // enterpriseConnections: ["oidc1"],
    appId: '5fa5053e252697ad5302ce7e',
    // autoRegister: true,
  }
  return (
    <AuthingGuard
      // onPwdResetError={(e) => console.log(e)}
      onLoad={() => console.log('fuck>>>>>>>>>>>')}
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
