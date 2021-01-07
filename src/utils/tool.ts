/*
 * @Author: Brian
 * @Date: 2021-01-07 13:36:22
 * @LastEditTime: 2021-01-07 13:49:35
 * @LastEditors: Please set LastEditors
 * @Description: 数组相关运算操作
 * @FilePath: \yingooShop\src\utils\tool.ts
 */

/**
 * @description: 二维数组变一维数组
 * @param {Array} arr
 * @return {Array}
 */ 
export function flattens(arr: any[]) {
    return [].concat( ...arr.map(x => Array.isArray(x) ? flattens(x) : x) ) 
}

/**
 * @description: 数组交集
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
export function intersection(a:Array<any>,b:Array<any>) {
    return a.filter(function(v){ return b.indexOf(v) > -1 })
}

/**
 * @description: 数组并集
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
export function union(a:Array<any>,b:Array<any>) {
    return a.concat(b.filter(function(v){ return !(a.indexOf(v) > -1)}));
}