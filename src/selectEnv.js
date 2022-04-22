'use strict';

const inquirer = require('inquirer');


/**
 * 1.选择部署环境
 * @param {*} CONFIG 配置文件内容
 */

const selectEnv = (CONFIG) => {
    return new Promise(async (resolve,reject)=>{
        const confirm = await inquirer.prompt({
            type: 'confirm',
            name: 'key',
            message: '是否部署到服务器?'
        });

        if(confirm.key === false){
            process.exit(0);
        }

        const select = await inquirer.prompt({
            type: 'list',
            name: 'key',
            message: '选择部署的环境',
            suffix: '(请和build环境保持一致)',
            choices: CONFIG.map((item, index) => ({
              name: `${item.name}`,
              value: index,
            })),
        });

        const selectServer = CONFIG[select.key];
        if(selectServer){
            resolve(selectServer);
        }else{
            reject();
        }
    });
}

module.exports = selectEnv;