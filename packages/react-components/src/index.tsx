import React from 'react'
import ReactDOM from 'react-dom'
import { AuthingGuard } from './components/AuthingGuard'
import { GuardConfig } from './components/AuthingGuard/types/GuardConfig'
import reportWebVitals from './reportWebVitals'

const App = () => {
  const config: GuardConfig = {
    apiHost: 'https://core.authing.cn',
    autoRegister: true,
  }
  return <AuthingGuard userPoolId="5f9c5f558551cad742475514" config={config} />
}

ReactDOM.render(
   <App/> ,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
