<template>
  <div id="authing_guard_container"></div>
</template>

<script>
import {
  AuthingGuard as NativeAuthingGuard,
  GuardEventsCamelToKebabMap,
  GuardMode,
  GuardScenes,
  LoginMethods,
  RegisterMethods,
} from '@authing/native-js-ui-components'
import '@authing/native-js-ui-components/lib/index.css'

export { GuardMode, GuardScenes, LoginMethods, RegisterMethods }

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

    const evts = Object.values(GuardEventsCamelToKebabMap)

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
