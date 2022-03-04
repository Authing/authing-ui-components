var replace = require("replace-in-file");
var path = require("path");

// 处理 antd reset css 问题
const removeAntdGlobalStyles = () => {
  console.log("\n🔥 开始处理 antd reset css 🔥");

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
