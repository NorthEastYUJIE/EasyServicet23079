// app.js
App({
  globalData: {
    userInfo: null,
    userId: null,
    location: null,
    baseUrl: 'http://127.0.0.1:3000'
  },

  onLaunch() {
    const userId = wx.getStorageSync('userId')
    const userInfo = wx.getStorageSync('userInfo')
    if (userId && userInfo) {
      this.globalData.userId = userId
      this.globalData.userInfo = userInfo
    }
    console.log('小程序启动，当前用户:', userId)
  }
})