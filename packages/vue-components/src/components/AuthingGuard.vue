<template>
  <div id="authing_guard_container"></div>
</template>

<script>
import {
  AuthingGuard as NativeAuthingGuard,
  // GuardEventsCamelToKebabMap,
} from '@authing/native-js-ui-components'
import '@authing/native-js-ui-components/lib/index.css'

export default {
  name: 'AuthingGuard',
  props: {
    userPoolId: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      required: false,
    },
  },
  mounted() {
    const guard = new NativeAuthingGuard(this.userPoolId, this.config)

    // const evts = Object.values(GuardEventsCamelToKebabMap)
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
