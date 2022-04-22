/**
 * 前端部署脚本
 * 
 * 流程：
 *  0.获取配置
 *  1.选择部署环境
 *  2.上传cdn
 *  3.项目压缩
 *  4.链接服务器
 *  5.部署项目
 */
/**
 * 前端部署项目脚本
 */
 const { textTitle, textInfo } = require('./utils/textConsole');

 const getConfig = require('./getConfig');
 const selectEnv = require('./selectEnv');
 const compressDist = require('./compressDist');
 const deploy = require('./deploy');
 const upload2cdn = require('./uploadcdn');
 
 /* =================== 0、获取配置 =================== */
 
 /* =================== 1、选择部署环境 =================== */
 
 /* =================== 2、上传cnd =================== */
 
 /* =================== 3、项目压缩 =================== */
 
 /* =================== 4、连接服务器 =================== */
 
 /* =================== 5、部署项目 =================== */
 
 async function start(cdnDir) {
   const CONFIG = await selectEnv(getConfig());
 
   if (!CONFIG) process.exit(1);
 
   textTitle('======== 自动部署项目 ========');
   textInfo('');
 
   if (CONFIG.cdn) {
     await upload2cdn({ ...CONFIG.cdn, cdnDir });
   }
   compressDist(CONFIG.local);
   await deploy(CONFIG.local, CONFIG.server);
   return CONFIG.name;
 }
 
 module.exports = start;
 