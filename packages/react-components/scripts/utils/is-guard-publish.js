module.exports = function isGuardPublish() {
  return Boolean(process.env.npm_guard_publish)
}
