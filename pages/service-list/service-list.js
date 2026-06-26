// pages/service-list/service-list.js
const { request } = require('../../utils/request')

Page({
  data: {
    cateId: '',
    cateName: '全部服务',
    services: [],
    page: 1,
    limit: 10,
    totalPages: 1,
    loading: false,
    finished: false
  },

  onLoad(options) {
    const { cateId, cateName } = options
    if (cateId) {
      this.setData({ cateId, cateName: cateName || '服务列表' })
    }
    this.loadServices()
  },

  loadServices() {
    if (this.data.loading || this.data.finished) return
    
    this.setData({ loading: true })
    
    const params = {
      page: this.data.page,
      limit: this.data.limit
    }
    
    if (this.data.cateId) {
      params.cateId = this.data.cateId
    }

    request({
      url: '/api/service/list',
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
    this.loadServices()
  },

  onPullDownRefresh() {
    this.setData({ services: [], page: 1, finished: false })
    this.loadServices()
    wx.stopPullDownRefresh()
  }
})