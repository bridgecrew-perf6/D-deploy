<h1 align="center">
        D-Deploy
	<br>
</h1>

<div align="center">

 ![GitHub release (latest by date)](https://img.shields.io/badge/dploy-v1.0-blue.svg) ![license-MIT](https://img.shields.io/badge/license-MIT-green.svg) ![build-passing](https://img.shields.io/badge/build-passing-green.svg) ![star-100](https://img.shields.io/badge/start-100-green.svg) ![node](https://img.shields.io/badge/node-v16.13.1-green.svg) ![npm](https://img.shields.io/badge/npm-8.1.2-green.svg)
</div>


Web前端项目自动部署脚本

## Install

```shell
npm install git+ssh://git@git.benewtech.cn:33/web/web-deploy.git --save-dev
```

## Usage

进入项目目录下

```javascript
import deploy from 'd-deploy';

deploy();
```

## deploy.config.json

- `name`: 名称

- `local`

  - `distDir`: 本地打包输出的路径
  - `distArchive`: 压缩打包文件的路径
  - `putFiles`: 其他文件

- `server`

  - `host`: 服务器 IP
  - `username`: 服务器的登录用户名
  - `port`: 端口
  - `serverDir`: 项目路径
  - `bakeup`: 是否备份压缩包

* `cdn`: 选填 为flase或不填则不传cdn

  - `phoneNumber`:  
  - `password`: 
  - `uploadDir`: 上传打包的路径
  - `cdnDir`: 上传七牛服务器路径,建议传package.json name/version

```javascript
[
  {
    "name": "prod",
    "cdn": {
      "phoneNumber": "10086",
      "password": "12345",
      "uploadDir": "./dist",
      "cdnDir": "pkgName/1.0.0"
    },
    "local": {
      "distDir": "./dist/*.*",
      "distArchive": "./deploy/dist.tar.gz",
      "putFiles": ["./deploy/pm2.prod.json", "./deploy/server.js"]
    },
    "server": {
      "host": "",
      "username": "devops",
      "port": 33,
      "serverDir": "/data/test",
      "bakeup": false
    }
  }
]
```

