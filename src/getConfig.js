'use strict';

const fs = require('fs');
const path = require('path');

const { textInfo, textError } = require('./utils/textConsole');

//0 获取配置

const getConfig = (testConfigJSON = null) =>{
    const configFile = path.resolve(process.cwd(), './deploy.config.json');
    if (!testConfigJSON && !fs.existsSync(configFile)) {
        textError(`${configFile} 不存在`);
        textInfo(`请先在项目根目录新建"deploy-config.json"，内容如下：
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
              "host": "120.78.72.255",
              "username": "devops",
              "port": 33,
              "serverDir": "/data/test",
              "bakeup": false
            }
          }
        ]  
        `);
        process.exit(1);
      }
      
      let config = testConfigJSON || fs.readFileSync(configFile)

      try {
        config = JSON.parse(config);
        const rootKeys = ['name'];
        const localKeys = ['distDir', 'distArchive'];
        const serverKeys = [
            'host',
            'username',
            'port',
            'serverDir',
            'bakeup',
        ];

        const someError = config.some((item)=>{
            const configLocalKeys = Object.keys(item.local);
            const configServerKeys = Object.keys(item.server);
            const hasAllRootKey = rootKeys.every((key)=>{
                Object.keys(item).includes(key);
            });
            const hasAllLocalKey = localKeys.every((key) =>
            configLocalKeys.includes(key)
            );
            const hasAllServerKey = serverKeys.every((key) =>
            configServerKeys.includes(key)
            );
            return !hasAllLocalKey || !hasAllServerKey || !hasAllRootKey;
        });
        if(someError){
            textError('deploy-config.json 配置不正确！\n');
            process.exit(1);
        }

      } catch (error) {
        textError(error);
      }
      return config;
}

module.exports = getConfig;