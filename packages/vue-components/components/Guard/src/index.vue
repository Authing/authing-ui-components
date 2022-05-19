<template>
  <div id="authing_guard_container" />
</template>

<script>
import {
  getAuthClient,
  initAuthClient,
  GuardMode,
  GuardScenes,
  LoginMethods,
  RegisterMethods,
  Guard as NativeGuard,
  GuardEventsCamelToKebabMapping,
} from "@authing/native-js-ui-components";
import "@authing/native-js-ui-components/lib/index.min.css";

export {
  getAuthClient,
  initAuthClient,
  GuardMode,
  GuardScenes,
  LoginMethods,
  RegisterMethods,
};

const callbackEvent = ["before-login", "before-register"];

export default {
  name: "Guard",
  props: {
    appId: {
      type: String,
      required: false,
    },
    tenantId: {
      type: String,
      required: false,
    },

    config: {
      type: Object,
      required: false,
    },
    authClient: {
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
      guardInstance: null,
      guarConfig: {},
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
          this.$emit("visible", val);
        }

        if (val) {
          this.show();
        } else {
          this.hide();
        }
      },
    },
  },
  computed: {
    mergeConfig: function () {
      return {
        ...this.config,
        appId: this.appId,
        mode: this.mode ?? this.config?.mode,
        autoRegister: this.autoRegister ?? this.config?.autoRegister,
        isSSO: this.isSSO ?? this.config?.isSSO,
        clickCloseable: this.clickCloseable ?? this.config?.clickCloseable,
        escCloseable: this.escCloseable ?? this.config?.escCloseable,
      };
    },
  },
  mounted() {
    this.guardInstance = new NativeGuard(
      this.appId,
      this.mergeConfig,
      this.tenantId,
      this.authClient
    );

    const evts = Object.values(GuardEventsCamelToKebabMapping);
    const kebabToCamelMap = Object.entries(
      GuardEventsCamelToKebabMapping
    ).reduce((acc, [camel, kebab]) => {
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

    evts.forEach((evtName) =>
      this.guardInstance.on(evtName, listeners[evtName])
    );

    if (this.localVisible) {
      this.guardInstance.show();
    }
  },
  methods: {
    show() {
      this.guardInstance.show();
    },
    hide() {
      this.guardInstance.hide();
    },
  },
};
</script>
