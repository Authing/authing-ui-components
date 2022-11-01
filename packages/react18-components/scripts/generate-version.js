const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const { version } = require('../package.json')

fs.writeFileSync(
  path.join(__dirname, '..', 'components', 'version', 'version.tsx'),
  `export default '${version}'`,
  'utf8'
)

console.log(chalk.green(`Generated version: ${version}`))

const generateVersion = () => {
  fs.writeFileSync(
    path.join(__dirname, '..', 'components', 'version', 'version.tsx'),
    `export default '${version}'`,
    'utf8'
  )

  console.log(chalk.green(`Generated version: ${version}`))
}

module.exports = {
  generateVersion,
}
