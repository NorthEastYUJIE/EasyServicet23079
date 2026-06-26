// pages/login/login.js
const { request } = require('../../utils/request')

Page({
  data: {
    account: '',
    password: '',
    loading: false
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },

  // 登录
  doLogin() {
    const { account, password } = this.data
    if (!account.trim()) {
      wx.showToast({ title: '请输入用户名或手机号', icon: 'none' })
      return
    }
    if (!password || password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    request({
      url: '/api/user/login',
      method: 'POST',
      data: { account, password }
    }).then(res => {
      const user = res.data
      wx.setStorageSync('userId', user.id)
      wx.setStorageSync('userInfo', user)
      getApp().globalData.userId = user.id
      getApp().globalData.userInfo = user
      
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1000)
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 去注册
  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  }
})