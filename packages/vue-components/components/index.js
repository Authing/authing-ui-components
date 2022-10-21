// import AuthingGuard from './AuthingGuard'
import Guard from './Guard'
import '@authing/native-js-ui-components/lib/index.min.css'

const components = [
	// AuthingGuard,
	Guard
]
// 全局注册
const install = (app) => {
	components.forEach(component => {
		app.component(component.name, component)
	})
}

// 局部注册
export {
	install,
	Guard,
	// AuthingGuard
}

export default {
	install
}
