import React, { useEffect, useRef } from 'react'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithADProps {
  onLogin: any
}

export const LoginWithAD = (props: LoginWithADProps) => {
  return <div className="authing-g2-login-ad">AD</div>
}
