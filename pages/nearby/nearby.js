// pages/nearby/nearby.js
const { request } = require('../../utils/request')

Page({
  data: {
    longitude: '',
    latitude: '',
    radius: '',
    services: [],
    page: 1,
    limit: 10,
    totalPages: 1,
    loading: false,
    finished: false,
    sortBy: 'distance',
    sortOrder: 'asc'
  },

  onLoad(options) {
    const { longitude, latitude } = options
    this.setData({ longitude, latitude })
    this.loadNearbyServices()
  },

  // 半径输入
  onRadiusInput(e) {
    this.setData({ radius: e.detail.value })
  },

  // 确认半径并搜索
  onRadiusConfirm() {
    this.setData({ services: [], page: 1, finished: false })
    this.loadNearbyServices()
  },

  // 切换排序
  toggleSort() {
    const newOrder = this.data.sortOrder === 'asc' ? 'desc' : 'asc'
    this.setData({
      sortOrder: newOrder,
      services: [],
      page: 1,
      finished: false
    })
    this.loadNearbyServices()
  },

  loadNearbyServices() {
    if (this.data.loading || this.data.finished) return

    this.setData({ loading: true })

    const params = {
      longitude: this.data.longitude,
      latitude: this.data.latitude,
      page: this.data.page,
      limit: this.data.limit,
      sortBy: this.data.sortBy,
      sortOrder: this.data.sortOrder
    }

    // 半径有值才传
    if (this.data.radius) {
      params.radius = this.data.radius
    }

    request({
      url: '/api/service/nearby',
      method: 'GET',
      data: params
    }).then(res => {
      const list = res.data.list || []
      const totalPages = res.data.totalPages || 1
      this.setData({
        services: [...this.data.services, ...list],
        totalPages,
        finished: this.data.page >= totalPages,
        page: this.data.page + 1
      })
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  onServiceTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${id}`
    })
  },

  onReachBottom() {
    this.loadNearbyServices()
  },

  onPullDownRefresh() {
    this.setData({ services: [], page: 1, finished: false })
    this.loadNearbyServices()
    wx.stopPullDownRefresh()
  }
})