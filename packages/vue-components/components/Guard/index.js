import Guard from './src/index.vue'
import '@authing/native-js-ui-components/lib/index.min.css'

Guard.install = (app) => {
	app.component(Guard.name, Guard)
}

export default Guard
