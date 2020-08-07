/*
 * @Author: jjw
 * @Date: 2020-04-22 09:34:21
 * @Description: 应用接口
 * @Last Modified by: jjw
 * @Last Modified time: 2020-04-22 18:39:53
 */

import baseAPI from '../base'

/**
 * @description 获取应用列表数据
 * @returns
 */
export const getApplicationList = () => {
  const params = {}

  return baseAPI.getListData('/applications', params)
}

/**
 * @description 获取应用跳转URL
 * @param {*} formData
 * @returns
 */
export const getApplicationUrl = (formData) => {
  const params = { ...formData }

  return baseAPI.getOneRowData('/application/url', params)
}
