/**
 * 2.上传文件到cdn服务器
 */

 const Axios = require('axios');
 const CryptoJS = require('crypto-js');
 const fs = require('fs');
 const path = require('path');
 const qiniu = require('qiniu');
 const chalk = require('chalk');
 const { textError, textSuccess, textInfo } = require('./utils/textConsole');
 
 let config = {
   apiUrl: '',  //自己配置 cdn的域名
   clientId: '', // 自己配置 Id
   clientSecret: '', // 自己配置  密钥
   // 外部传入
   phoneNumber: '',
   password: '',
   cdnDir: '',
   uploadDir: './dist',
 };
 
 //api 路径
 const api = {
   oauth: '/oauth/token',
   login: '/v5/sms/login/password',
   token: '/v5/asset/upload/token',
   // version: '/v5/asset/version',
 };
 
 let authorization = null;
 let userId = 0;
 
 // eslint-disable-next-line no-unused-vars
 function request(options) {
   return new Promise((resolve, reject) => {
     Axios({
       method: 'post',
       headers: {
         'User-Agent': 'upload web',
         'Content-type': 'application/json',
         Authorization: authorization,
       },
       baseURL: config.apiUrl,
       ...options,
     })
       .then((res) => {
         resolve(res.data);
       })
       .catch((error) => {
         reject(error);
       });
   });
 }
 
 const generateSecret = (scope, timestamp, appSecret) => {
   const qs = `scope=${scope}&timestamp=${timestamp}`;
   const sha1 = CryptoJS.HmacSHA1(qs, appSecret).toString(CryptoJS.enc.Hex);
   return CryptoJS.MD5(sha1).toString();
 };
 
 async function oauthToken() {
   console.log('start oauth token...');
   const { clientId, clientSecret } = config;
   const timestamp = new Date().getTime();
   const scope = `user_${userId}`;
   const body = {
     grant_type: 'client_credentials',
     client_id: clientId,
     client_secret: generateSecret(scope, timestamp, clientSecret),
     scope,
   };
 
   const res = await request({ url: api.oauth, params: { timestamp }, data: body });
   if (res) {
     authorization = `${res.token_type} ${res.access_token}`;
     console.log('oauth token success');
   }
 }
 
 async function login() {
   console.log('start login...');
   const timestamp = new Date().getTime();
   const body = {
     callingCode: '86',
     phoneNumber: config.phoneNumber,
     password: config.password,
   };
 
   const res = await request({
     url: api.login,
     params: { timestamp },
     data: body,
   });
   if (res) {
     authorization = `${res.token_type} ${res.access_token}`;
     userId = res.uid;
     console.log('login success userId: ', userId);
   }
 }
 
 async function getAssetToken() {
   console.log('start get asset token...');
   const res = await request({ url: api.token, params: { userId } });
   console.log('get asset token success');
   return res.uptoken;
 }
 
 /**
  * 文件遍历方法
  * @param filePath 需要遍历的文件路径
  */
 function fileDisplay(root, dirPath, files) {
   // 根据文件路径读取文件，返回文件列表
   const dirFiles = fs.readdirSync(path.join(root, dirPath));
   dirFiles.forEach((f) => {
     const stat = fs.statSync(path.join(root, dirPath, f));
     if (stat.isFile() && f[0] !== '.') {
       files.push(path.join(dirPath, f));
     }
     if (stat.isDirectory()) {
       fileDisplay(root, path.join(dirPath, f), files);
     }
   });
 }
 
 function searchUploadDir() {
   const { uploadDir } = config;
   if (!fs.existsSync(uploadDir)) {
     textError(
       `× 上传路径 [local.uploadDir] 配置不正确! ${uploadDir} 不存在\n`
     );
     process.exit(1);
   }
   const files = [];
   fileDisplay(uploadDir, '/', files);
   console.log('load upload file count: ', files.length);
   return files;
 }
 
 const qiniuConfig = new qiniu.conf.Config();
 // 空间对应的机房
 qiniuConfig.zone = qiniu.zone.Zone_z2;
 // 是否使用https域名
 // qiniuConfig.useHttpsDomain = true;
 // 上传是否使用cdn加速
 // qiniuConfig.useCdnDomain = true;
 const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
 async function qiniuUploadFile(file, key, token) {
   return new Promise((resolve, reject) => {
     const putExtra = new qiniu.form_up.PutExtra();
     formUploader.putFile(token, key, file, putExtra, (respErr, respBody, respInfo) => {
       if (respErr) {
         textError('上传文件网络错误', respErr);
         return reject(respErr);
       }
 
       if (respInfo.statusCode === 200) {
         resolve(respBody);
       } else {
         textError(`上传失败: ${file}`, respBody);
       }
     });
   });
 }
 
 async function uploadFiles(uploadFilePaths, qiniuToken) {
   const { cdnDir, uploadDir } = config;
   textInfo('start upload file ...');
   await Promise.all(
     uploadFilePaths.map(async (item, index) => {
       await qiniuUploadFile(
         path.join(uploadDir, item),
         `${cdnDir}${item}`,
         qiniuToken,
       );
       console.log(`upload success: ${item}, ${index + 1}/${uploadFilePaths.length}`);
     }),
   );
   console.log('upload files finish, cdnDir: ', cdnDir);
//    配置自己上传的域名 https://assets.demo.cn/${cdnDir}/{filePath}
   textInfo(`cdn url: `,);
 }
 
 // async function postVersion() {
 //   console.log('start post version...')
 //   const res = await request({ url: api.version, params: { userId }, data: { version: webVersion } })
 //   console.log('post version success', res)
 // }
 
 async function processUpload(cndConfig = {}) {
   config = { ...config, ...cndConfig };
   textInfo('开始上传cdn');
   try {
     const uploadFilePaths = searchUploadDir();
     await oauthToken();
     await login();
     const qiniuToken = await getAssetToken();
     await uploadFiles(uploadFilePaths, qiniuToken);
     // await postVersion() // 上报版本接口报错
     textSuccess('上传cnd成功');
   } catch (error) {
     console.log(error.response ? error.response.data : error);
     textError(chalk.red('上传cnd失败\n'));
     Promise.reject(error);
     process.exit(1);
   }
 }
 
 module.exports = processUpload;
 