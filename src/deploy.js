/**
 * 4.连接服务器
 * @param {*} params { host, username, password }
 */

'use strict';

const {promisify}  = require('util')
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const {NodeSSH} = require('node-ssh');
const { textError, textInfo } = require('./utils/textConsole');
const spawnCommand = require('./utils/spawnCommand');
const { getTime } = require('./utils/index')

const SSH = new NodeSSH();


async function connectServer(params){
    const spinner = ora(
        chalk.cyan('正在连接服务器...\n')
    ).start();

    await SSH.connect(params)
    .then(()=>{
        spinner.succeed(chalk.green('服务器连接成功！\n'));
    })
    .catch((err)=>{
        spinner.fail(chalk.red('服务器连接失败！\n'));
        textError(err);
        process.exit(1);
    })
}

/**
 * 通过 ssh 在服务器上命令
 * @param {*} cmd shell 命令
 * @param {*} cwd 路径
 */
async function runCommand(cmd,cwd){
    await SSH.execCommand(cmd, {
        cwd,
        onStderr(chunk) {
          textError(`${cmd}, stderrChunk, ${chunk.toString('utf8')}`);
        },
    });
}


/* =================== 4、部署项目 =================== */
async function deploy(LOCAL_CONFIG,SERVER_CONFIG,next){
    const {
        host,
        username,
        serverDir,
        bakeup,
        port,
      } = SERVER_CONFIG;
    
      const { putFiles = [], distArchive } = LOCAL_CONFIG;
    
      if (!serverDir.startsWith('/') || serverDir === '/') {
        textError(`[server.serverDir: ${serverDir}] 需为绝对路径，且不能为根目录"/"`);
        process.exit(1);
      }
    
      // 连接服务器
      await connectServer({ host, username, privateKey: `${process.env.HOME}/.ssh/id_rsa`, port });
    
      const spinner = ora(chalk.cyan('正在部署项目...\n')).start();
    
      const files = [LOCAL_CONFIG.distArchive, ...putFiles].map(filePath => {
        const local = path.resolve(process.cwd(), filePath);
        const remote = `${serverDir}/${path.basename(local)}`;
        return { local, remote };
      });
    
      const distArchiveName = path.basename(LOCAL_CONFIG.distArchive);
    
      try {
        // 上传压缩的项目文件
        await SSH.putFiles(files);
    
        // 解压缩上传的项目文件
        await runCommand(`tar -xzf ${distArchiveName}`, serverDir);
    
        if (bakeup) {
          // 备份重命名原项目的文件
          await runCommand(`mv ${distArchiveName} ${getTime()}_${distArchiveName}`, serverDir);
        }
    
        spinner.succeed(chalk.green('部署完成！\n'));
    
        await SSH.dispose();
    
        await spawnCommand('rm', ['-rf', distArchive]);
    
        textInfo(`项目路径： ${serverDir}`);
        textInfo(new Date().toLocaleString());
        if (next) next();
      } catch (err) {
        spinner.fail(chalk.red('部署失败！\n'));
        textError(`catch: ${err} `);
        process.exit(1);
      }
}

 module.exports = promisify(deploy);