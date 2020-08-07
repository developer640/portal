import {
  login,
  logout,
  getUserInfo
} from '@/api/user'

import { getApplicationList } from '@/api/application'

import { setToken, getToken } from '@/libs/util'

export default {
  state: {
    token: getToken(),
    name: '',
    deptName: '',
    userName: '',
    gender: '男',
    applications: [], // 应用列表
    hasGetInfo: false // 判断当页面刷新后，要重新获取用户信息
  },
  mutations: {
    setName (state, name) {
      state.name = name
    },
    setUserName (state, userName) {
      state.userName = userName
    },
    setDeptName (state, deptName) {
      state.deptName = deptName
    },
    setGender (state, gender) {
      state.gender = gender
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setApplications (state, appList) {
      state.applications = appList
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    }
  },
  getters: {
    name: state => state.name,
    userName: state => state.userName,
    deptName: state => state.deptName,
    gender: state => state.gender,
    applications: state => state.applications,
    token: state => state.token,
    userInfo: state => `${state.userName}（${state.name}）`
  },
  actions: {
    // 登录
    handleLogin ({ commit }, { userName, password }) {
      commit('setHasGetInfo', false)
      return new Promise((resolve, reject) => {
        login({
          userName,
          password
        }).then(res => {
          resolve(res.data)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      commit('setToken', '')
      return new Promise((resolve, reject) => {
        logout().then(() => {
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 获取用户相关信息
    getUserInfo ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          getUserInfo().then(res => {
            const data = res.data
            commit('setName', data.data.name)
            commit('setUserName', data.data.userName)
            commit('setDeptName', data.data.deptName)
            commit('setGender', data.data.gender)
            commit('setHasGetInfo', true)
            resolve(res.data)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    // 获取应用列表数据
    getApplicationList ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          getApplicationList().then(res => {
            const data = res.data
            commit('setApplications', data.data)
            resolve(res.data)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
