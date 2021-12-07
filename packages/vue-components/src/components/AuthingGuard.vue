<template>
  <div id="authing_guard_container"></div>
</template>

<script>
import {
  getAuthClient,
  initAuthClient,
  AuthingGuard as NativeAuthingGuard,
  GuardEventsCamelToKebabMap,
  GuardMode,
  GuardScenes,
  LoginMethods,
  RegisterMethods,
} from "@authing/native-js-ui-components";
import "@authing/native-js-ui-components/lib/index.min.css";

export { getAuthClient, initAuthClient, GuardMode, GuardScenes, LoginMethods, RegisterMethods };

const format = (a, b) => {
  return !a || a === "false" ? b : true;
};

const callbackEvent = ["before-login", "before-register"];

export default {
  name: "AuthingGuard",
  props: {
    appId: {
      type: String,
      required: true,
    },
    tenantId: {
      type: String,
      required: false,
    },
    config: {
      type: Object,
      required: false,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      required: false, // normal(全屏) modal(弹窗)
    },
    autoRegister: {
      type: Boolean,
      required: false,
    },
    isSSO: {
      type: Boolean,
      required: false,
    },
    clickCloseable: {
      type: Boolean,
      default: true,
      required: false,
    },
    escCloseable: {
      type: Boolean,
      default: true,
      required: false,
    },
    onBeforeLogin: {
      type: Function,
      required: false,
    },
    onBeforeRegister: {
      type: Function,
      required: false,
    },
  },
  data() {
    return {
      localVisible: false,
      $guard: null,
      localConfig: this.config
    };
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val !== this.localVisible) {
          this.localVisible = val;
        }
      },
    },
    localVisible: {
      handler(val) {
        if (val !== this.visible) {
          this.$emit("update:visible", val);
        }

        if (val) {
          this.show();
        } else {
          this.hide();
        }
      },
    },
  },
  mounted() {
    this.localConfig = this.localConfig || {};
    this.localConfig.mode = this.mode ? this.mode : this.localConfig.mode;
    this.localConfig.autoRegister = this.autoRegister ? this.autoRegister : this.localConfig.autoRegister;
    this.localConfig.isSSO = this.isSSO ? this.isSSO : this.localConfig.isSSO;
    this.localConfig.clickCloseable = this.clickCloseable ? this.clickCloseable : this.localConfig.clickCloseable;
    this.localConfig.escCloseable = this.escCloseable ? this.escCloseable : this.localConfig.escCloseable;

    // this.config.autoRegister = format(this.autoRegister, this.config.autoRegister)
    // this.config.isSSO = format(this.isSSO, this.config.isSSO)
    // this.config.clickCloseable = format(this.clickCloseable, this.config.clickCloseable)
    // this.config.escCloseable = format(this.escCloseable, this.config.escCloseable)

    const guard = new NativeAuthingGuard(this.appId, this.localConfig, this.tenantId);

    const evts = Object.values(GuardEventsCamelToKebabMap);
    const kebabToCamelMap = Object.entries(GuardEventsCamelToKebabMap).reduce((acc, [camel, kebab]) => {
      return Object.assign({}, acc, {
        [kebab]: camel,
      });
    }, {});

    const listeners = evts.reduce((acc, evtName) => {
      return Object.assign({}, acc, {
        [evtName]: (...rest) => {
          if (evtName === "close") {
            this.localVisible = false;
          }
          if (!callbackEvent.includes(evtName)) {
            this.$emit(evtName, ...rest);
          } else {
            const camelEvtName = kebabToCamelMap[evtName];

            if (this[camelEvtName]) {
              return this[camelEvtName](...rest);
            }
            return true;
          }
        },
      });
    }, {});

    evts.forEach((evtName) => guard.on(evtName, listeners[evtName]));

    if (this.localVisible) {
      guard.show();
    }
    this.$guard = guard;
  },
  methods: {
    show() {
      this.$guard.show();
    },
    hide() {
      this.$guard.hide();
    },
  },
};
</script>
