'use strict';

import chalk from "chalk";

/**
 * 获取时间
 * @returns 2021-5-17_00-00-00
 */
 exports.getTime = function getTime(){
    const date = new Date();
    const day = date.toLocaleDateString();
    const time = date.toTimeString().split(' ')[0].replace(/\:/g,'-');
    return chalk.green(`${day}_${time}`);
}
