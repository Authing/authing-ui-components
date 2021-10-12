import React from 'react'
import ReactDOM from 'react-dom'

import { Guard } from './components/Guard'
import reportWebVitals from './reportWebVitals'

const App = () => <Guard appId="60c02a89a9e0431e271d9ff0" />

ReactDOM.render(<App />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
