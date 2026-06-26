// pages/service-detail/service-detail.js
const { request } = require('../../utils/request')

Page({
  data: {
    service: null,
    serviceId: ''
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }
    this.setData({ serviceId: id })
    this.loadDetail(id)
  },

  loadDetail(id) {
    request({
      url: '/api/service/detail',
      data: { id }
    }).then(res => {
      this.setData({ service: res.data })
    }).catch(() => {
      wx.showToast({ title: '服务不存在', icon: 'none' })
    })
  },

  // 地图导航 - 调用 wx.openLocation 打开微信地图（默认腾讯地图）
  openMap() {
    const { service } = this.data
    if (!service || !service.latitude) {
      wx.showToast({ title: '位置信息不完整', icon: 'none' })
      return
    }
    
    // 打开微信内置地图，传入服务提供者经纬度
    wx.openLocation({
      latitude: parseFloat(service.latitude),
      longitude: parseFloat(service.longitude),
      name: service.serviceName,
      address: service.address,
      scale: 18
    })
  },

  goAppointment() {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      wx.showModal({
        title: '需要登录',
        content: '预约前请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }
    wx.navigateTo({
      url: `/pages/appointment/appointment?serviceId=${this.data.serviceId}`
    })
  },

  goMyAppointment() {
    wx.navigateTo({
      url: '/pages/my-appointment/my-appointment'
    })
  }
})