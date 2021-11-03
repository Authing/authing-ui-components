var shell = require("shelljs");

// shell.exec("npm run build:lib");

shell.cd("./packages/react-components");
var react = shell.exec("npm run build:lib");
if (react.code !== 0) {
  shell.echo("React Build 失败了 🐛");
  shell.exit(1);
}

shell.cd("../native-js");
var native = shell.exec("npm run build:lib");
if (native.code !== 0) {
  shell.echo("Native Build 失败了 🐛");
  shell.exit(1);
}

shell.exit(0);
