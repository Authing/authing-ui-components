const fs = require('fs-extra')
const path = require('path')

const fileName = 'examples.tsx'

const fileContent = `import React from 'react'
import ReactDOM from 'react-dom'
import reportWebVitals from './reportWebVitals'
import { Guard } from './components'

const App = () => {
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
      <Guard appId="AUTHING_APP_ID" />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

reportWebVitals()
`

fs.access(`${fileName}`, fs.constants.F_OK, (err) => {
  if (err !== null) {
    fs.writeFileSync(path.join(__dirname, '..', fileName), fileContent, 'utf8')
  }
})
