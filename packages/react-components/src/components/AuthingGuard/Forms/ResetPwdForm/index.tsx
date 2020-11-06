import React, { FC, useEffect, useState } from 'react'

import { ResetPasswordStep1 } from './Step1'
import { ResetPasswordStep2 } from './Step2'
import { ResetPasswordStep3 } from './Step3'
import { ResetPasswordStep4 } from './Step4'
import { ResetPwdFormFooter } from './Footer'
import { useGuardContext } from '@/context/global/context'

import './style.less'

export const ResetPasswordForm: FC = () => {
  const { setValue } = useGuardContext()

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    switch (step) {
      case 1:
        setValue('guardTitle', '找回密码')
        break
      case 2:
      case 3:
      case 4:
        setValue('guardTitle', '重置密码')
        break
      default:
        setValue('guardTitle', '找回密码')
        break
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const onStep1Finish = async (type: string, value: string) => {
    if (type === 'phone') {
      setPhone(value)
      setStep(2)
    } else if (type === 'email') {
      setEmail(value)
      setStep(3)
    }
  }

  const onStep2OrStep3Finish = () => {
    setStep(4)
  }

  const getForm = () => {
    switch (step) {
      case 1:
        return (
          <ResetPasswordStep1 onSuccess={onStep1Finish}></ResetPasswordStep1>
        )
      case 2:
        return (
          <ResetPasswordStep2
            phone={phone}
            onSuccess={onStep2OrStep3Finish}
          ></ResetPasswordStep2>
        )
      case 3:
        return (
          <ResetPasswordStep3
            email={email}
            onSuccess={onStep2OrStep3Finish}
          ></ResetPasswordStep3>
        )
      case 4:
        return <ResetPasswordStep4></ResetPasswordStep4>
      default:
        return null
    }
  }

  return (
    <div>
      {getForm()}
      {step !== 4 && <ResetPwdFormFooter />}
    </div>
  )
}
