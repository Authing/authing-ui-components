import AuthingGuard from './src/index.vue'
import '@authing/native-js-ui-components/lib/index.min.css'

AuthingGuard.install = (app) => {
	app.component(AuthingGuard.name, AuthingGuard)
}

export default AuthingGuard
