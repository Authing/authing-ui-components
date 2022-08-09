const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const generateVersion = () => {
  const { version } = require(path.resolve(process.cwd(), 'package.json'))
  fs.writeFileSync(
    path.join(process.cwd(), 'components', 'version', 'version.tsx'),
    `export default '${version}'`,
    'utf8'
  )

  console.log(chalk.green(`Generated version: ${version}`))
}

module.exports = {
  generateVersion,
}
