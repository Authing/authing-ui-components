import React, { useEffect } from 'react'
import './App.css'
import { AuthingGuard, GuardMode } from './components'

function App() {
  useEffect(() => {
    const guard = new AuthingGuard('59f86b4832eb28071bdd9214', {
      target: '.App',
      apiHost: 'http://console.authing.localhost:3000',
      mode: GuardMode.Modal,
    })

    // @ts-ignore
    window.guard = guard

    // guard.show()

    guard.on('load', (e) => {
      console.log('加载啊', e)
    })

    guard.on('close', () => {
      setTimeout(() => {
        guard.show()
      }, 2000)
    })
  }, [])

  return <div className="App"></div>
}

export default App
