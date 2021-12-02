const chalk = require('chalk')
const isGuardPublish = require('./utils/is-guard-publish')
function reportError() {
  console.log(chalk.red('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'))
  console.log(
    chalk.red('!!          ⚠️⚠️ Authing FE 神兽警告 ⚠️⚠️           !!')
  )
  console.log(chalk.red('!! `npm publish` is forbidden for this package. !!'))
  console.log(chalk.red('!!    Use `npm run pub`| `yarn pub` instead.    !!'))
  console.log(chalk.red('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'))
}

if (!isGuardPublish()) {
  reportError()
  process.exit(1)
}
