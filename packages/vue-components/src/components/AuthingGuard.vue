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
import '@authing/native-js-ui-components/lib/index.min.css'

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
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      localVisible: false,
      $guard: null,
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val !== this.localVisible) {
          this.localVisible = val
        }
      },
    },
    localVisible: {
      handler(val) {
        if (val !== this.visible) {
          this.$emit('update:visible', val)
        }

        if (val) {
          this.show()
        } else {
          this.hide()
        }
      },
    },
  },
  mounted() {
    const guard = new NativeAuthingGuard(this.userPoolId, this.config)

    const evts = Object.values(GuardEventsCamelToKebabMap)

    const listeners = evts.reduce((acc, evtName) => {
      return Object.assign({}, acc, {
        [evtName]: (...rest) => {
          if (evtName === 'close') {
            this.localVisible = false
          }
          this.$emit(evtName, ...rest)
        },
      })
    }, {})

    evts.forEach((evtName) => guard.on(evtName, listeners[evtName]))

    if (this.localVisible) {
      guard.show()
    }
    this.$guard = guard
  },
  methods: {
    show() {
      this.$guard.show()
    },
    hide() {
      this.$guard.hide()
    },
  },
}
</script>
