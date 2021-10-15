import React, { useEffect, useRef } from 'react'
import { useAuthClient } from '../../Guard/authClient'

interface LoginWithLDAPProps {
  onLogin: any
}

export const LoginWithLDAP = (props: LoginWithLDAPProps) => {
  return <div className="authing-g2-login-ldap">LDAP</div>
}
