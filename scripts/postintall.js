#!/usr/bin/env node
const replace = require("replace-in-file");
const path = require("path");

// antd 不污染全局
const removeAntdGlobalStyles = () => {
  const rootDir = path.resolve(__dirname, "../");

  const options = {
    files: [
      `${rootDir}/node_modules/antd/lib/style/core/index.less`,
      `${rootDir}/node_modules/antd/es/style/core/index.less`,
    ],
    from: "@import 'global';",
    to: "",
  };

  replace(options)
    .then(() => {
      console.log("[INFO] Successfully Removed Antd Global Styles");
    })
    .catch((e) => {
      console.error("[ERR] Error removing Antd Global Styles:", e);
      process.exit(1);
    });
};

removeAntdGlobalStyles();
