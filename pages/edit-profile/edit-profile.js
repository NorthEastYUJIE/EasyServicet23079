// pages/edit-profile/edit-profile.js
const { request } = require('../../utils/request')

Page({
  data: {
    userId: '',
    nickname: '',
    avatar: '',
    tempAvatar: ''
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userId: userInfo.id,
        nickname: userInfo.nickname || '',
        avatar: userInfo.avatar || ''
      })
    }
  },

  onInput(e) {
    this.setData({
      nickname: e.detail.value
    })
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const filePath = res.tempFiles[0].tempFilePath
        // 上传到服务器
        wx.uploadFile({
          url: 'http://127.0.0.1:3000/api/upload/image',
          filePath: filePath,
          name: 'file',
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data)
            if (data.code === 200) {
              this.setData({
                avatar: data.data.url,
                tempAvatar: data.data.url
              })
              wx.showToast({ title: '上传成功', icon: 'success' })
            }
          },
          fail: () => {
            wx.showToast({ title: '上传失败', icon: 'none' })
          }
        })
      }
    })
  },

  // 保存
  saveProfile() {
    const { userId, nickname, avatar } = this.data
    if (!nickname.trim()) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }

    request({
      url: '/api/user/updateInfo',
      method: 'POST',
      data: {
        userId: userId.toString(),
        nickname,
        avatar
      }
    }).then(res => {
      // 更新本地缓存
      const userInfo = wx.getStorageSync('userInfo')
      userInfo.nickname = nickname
      userInfo.avatar = avatar
      wx.setStorageSync('userInfo', userInfo)
      getApp().globalData.userInfo = userInfo
      
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    })
  }
})