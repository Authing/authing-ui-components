import React from 'react'
import ReactDOM from 'react-dom'

import reportWebVitals from './reportWebVitals'
import { message } from 'antd'
import { Guard } from './components'

const App = () => {
  // 移动端点击事件延时问题
  var FastClick = require('fastclick')
  if ('addEventListener' in document) {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        FastClick.attach(document.body)
      },
      false
    )
  }
  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        justifyContent: 'center',
        WebkitUserSelect: 'none',
        minHeight: '100vh',
        background: '#F5F7FA',
      }}
    >
      <Guard
        appId="61b6fd378bd9e04e260a76fc"
        // appId="61b04e9d9c7862a906c32355"
        // appId="61a85ff3350caf330f1667ba"
        // appId="6191cf610f772aa56dc70637"
        // tenantId="6194a41abf23c1d5268b362a1"
        // visible={true}
        onLogin={(u) => {
          message.info('🏁 用户业务层终点，登录完成。')
          console.log(u)
        }}
        // visible={true}
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
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
