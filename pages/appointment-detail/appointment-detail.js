// pages/appointment-detail/appointment-detail.js
const { request } = require('../../utils/request')

Page({
  data: {
    detail: null
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }
    this.loadDetail(id)
  },

  loadDetail(id) {
    request({
      url: '/api/appointment/detail',
      data: { id }
    }).then(res => {
      this.setData({ detail: res.data })
    })
  },

  getStatusStyle(status) {
    const styles = {
      '0': { color: '#fa8c16', text: '待确认' },
      '1': { color: '#1890ff', text: '已接单' },
      '2': { color: '#52c41a', text: '已完成' },
      '3': { color: '#999999', text: '已取消' }
    }
    return styles[status] || styles['0']
  },

  // 取消预约
  cancelOrder() {
    const { detail } = this.data
    wx.showModal({
      title: '确认取消',
      content: '确定取消该预约？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/api/appointment/cancel',
            method: 'POST',
            data: { id: detail.id }
          }).then(() => {
            wx.showToast({ title: '取消成功', icon: 'success' })
            setTimeout(() => {
              wx.navigateBack()
            }, 1000)
          })
        }
      }
    })
  },

  // 再次预约
  reBook() {
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${this.data.detail.serviceId}`
    })
  }
})