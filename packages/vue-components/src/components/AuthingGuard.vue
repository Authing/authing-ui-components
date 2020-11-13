<template>
  <div id="authing_guard_container"></div>
</template>

<script>
import { AuthingGuard as NativeAuthingGuard } from '@authing/native-js-ui-components'
import '@authing/native-js-ui-components/lib/index.css'

export default {
  name: 'AuthingGuard',
  mounted() {
    const guard = new NativeAuthingGuard('59f86b4832eb28071bdd9214', {
      target: '#authing_guard_container',

      apiHost: 'http://console.authing.localhost:3000',
      // loginMethods: Object.values(LoginMethods),
      logo:
        'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
      title: 'Authing',
      // defaultLoginMethod: LoginMethods.LDAP,
      // registerMethods: Object.values(RegisterMethods),
      // defaultRegisterMethod: RegisterMethods.Email,
      defaultScenes: 'login',
      // socialConnections: Object.values(SocialConnections),
      // enterpriseConnections: ["oidc1"],
      appId: '5fa5053e252697ad5302ce7e',
      // autoRegister: true,
    })

    const evts = [
      'load',
      'load-error',
      'login',
      'login-error',
      'register',
      'register-error',
      'pwd-email-send',
      'pwd-email-send-error',
      'pwd-phone-send',
      'pwd-phone-send-error',
      'pwd-reset',
      'pwd-reset-error',
      'close',
    ]

    const listeners = evts.reduce((acc, evtName) => {
      return Object.assign({}, acc, {
        [evtName]: (...rest) => {
          this.$emit(evtName, ...rest)
        },
      })
    }, {})

    evts.forEach((evtName) => guard.on(evtName, listeners[evtName]))
  },
}
</script>
