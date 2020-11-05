import React from 'react'
import ReactDOM from 'react-dom'
import { AuthingGuard } from './components/AuthingGuard'
import {
  GuardConfig,
  LoginMethods,
  RegisterMethods,
  GuardScenes,
} from './components/AuthingGuard/types/GuardConfig'
import reportWebVitals from './reportWebVitals'

const App = () => {
  const config: GuardConfig = {
    apiHost: 'https://core.authing.cn',
    loginMethods: Object.values(LoginMethods),
    logo:
      'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
    title: 'Authing',
    defaultLoginMethod: LoginMethods.LDAP,
    registerMethods: Object.values(RegisterMethods),
    defaultRegisterMethod: RegisterMethods.Email,
    defaultScenes: GuardScenes.Login,
    // autoRegister: true,
  }
  return <AuthingGuard userPoolId="5f9c5f558551cad742475514" config={config} />
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
