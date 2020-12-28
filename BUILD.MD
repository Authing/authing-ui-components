### 注意！！！

不要用 npm，要用 yarn

### 安装所有依赖

根目录执行 `yarn install`

### 发包

在根目录执行 `yarn build:publish`，会先选择版本号，然后 build，然后推送到 npm

### 更新包

目前是直接到对应 package 下面直接修改版本号然后到根目录 yarn 的，不知道 `yarn upgrade` 行不行
