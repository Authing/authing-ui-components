const chalk = require('chalk')

console.log(chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'))
console.log(chalk.bgRed('!! `npm publish` is forbidden for this package. !!'))
console.log(chalk.bgRed('!! Use `npm run pub` instead.        !!'))
console.log(chalk.bgRed('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'))

process.exit(1)
