const chalk = require('chalk')
const isGuardPublish = require('./utils/is-guard-publish')
function reportError() {
  console.log(chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'))
  console.log(
    chalk.bgRed('!!          ⚠️⚠️ Authing FE 神兽警告 ⚠️⚠️           !!')
  )
  console.log(chalk.bgRed('!! `npm publish` is forbidden for this package. !!'))
  console.log(chalk.bgRed('!!    Use `npm run pub`| `yarn pub` instead.    !!'))
  console.log(chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'))
}

if (!isGuardPublish()) {
  reportError()
  process.exit(1)
}
