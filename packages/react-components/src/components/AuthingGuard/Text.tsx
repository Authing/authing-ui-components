import React from 'react'
import { useGlobalContext } from '../../context/global/context'

export const Test = () => {
    const { state, setValue } = useGlobalContext()

return <div onClick={() => setValue('a', state.a + 1)}>{state.a}</div>
}