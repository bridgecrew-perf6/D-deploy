'use strict';

/**
 *  3.压缩打包的项目
 * @param {*} LOCAL_CONFIG 本地配置
 */
const chalk = require('chalk');
const ora = require('ora');
const { promisify } = require('util');
const { spawnSync } = require('child_process');
const { textError } = require('./utils/textConsole');


const compressDist = (LOCAL_CONFIG)=>{
    try {
        const { distDir, distArchive } = LOCAL_CONFIG;
        const spinner = ora(chalk.cyan('正在压缩...\n')).start();
        spawnSync('tar', ['-zcf', distArchive, distDir], { cwd: process.cwd(), shell: true });
        spinner.succeed(chalk.green('压缩完成！\n'));
    } catch (error) {
        textError('压缩失败！', error);
    }   
}

module.exports = promisify(compressDist);