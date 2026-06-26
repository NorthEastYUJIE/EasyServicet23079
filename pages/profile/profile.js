// pages/profile/profile.js
const { request } = require('../../utils/request')

Page({
  data: {
    userInfo: null,
    isLogin: false
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')
    if (userId && userInfo) {
      this.setData({
        userInfo,
        isLogin: true
      })
      getApp().globalData.userId = userId
      getApp().globalData.userInfo = userInfo
    } else {
      this.setData({
        userInfo: null,
        isLogin: false
      })
    }
  },

  // 去登录
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  // 编辑资料
  goEdit() {
    wx.navigateTo({ url: '/pages/edit-profile/edit-profile' })
  },

  // 我的预约
  goMyAppointment() {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.switchTab({ url: '/pages/my-appointment/my-appointment' })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userId')
          wx.removeStorageSync('userInfo')
          getApp().globalData.userId = null
          getApp().globalData.userInfo = null
          this.setData({ userInfo: null, isLogin: false })
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  }
})