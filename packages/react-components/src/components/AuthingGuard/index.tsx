import React from 'react'
import { GlobalContext } from '../../context/global/context'
import './index.css'
import { Test } from './Text'

export const AuthingGuard = () => {
    return <GlobalContext value={{a: 1}}>
        <div className="authing-guard-wrapper">Authing Guard</div>
        <Test/>
    </GlobalContext>
}