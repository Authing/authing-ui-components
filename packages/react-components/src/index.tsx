import React from 'react'
import ReactDOM from 'react-dom'

import { Guard } from './components/Guard'
import { AuthingGuard } from './components/AuthingGuard'
import reportWebVitals from './reportWebVitals'
import { LoginMethods } from 'authing-js-sdk'

const App = () => {
  return (
    <div>
      <Guard
        appId="610271b10cd9106606c73d57"
        onLogin={(u) => console.log('🏁 业务终点，登录完成。', u)}
      />

      <AuthingGuard
        appId="6167e1e3f19080f1bf7b7797"
        config={{
          loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
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
