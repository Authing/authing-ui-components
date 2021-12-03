module.exports = function isGuardPublish() {
  const configArgv = JSON.parse(process.env.npm_config_argv).original
  return configArgv.includes('--guard-publish')
}
