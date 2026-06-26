// pages/my-appointment/my-appointment.js
const { request } = require('../../utils/request')

Page({
  data: {
    status: '', // 空=全部, 0=待确认, 1=已接单, 2=已完成, 3=已取消
    tabs: [
      { value: '', label: '全部' },
      { value: 0, label: '待确认' },
      { value: 1, label: '已接单' },
      { value: 2, label: '已完成' },
      { value: 3, label: '已取消' }
    ],
    allAppointments: [], // 存全部数据
    appointments: [], // 当前显示的数据
    loading: false,
    finished: false,
    userId: ''
  },

  onLoad() {
    const userId = wx.getStorageSync('userId')
    this.setData({ userId })
    this.loadAppointments()
  },

  onShow() {
    this.loadAppointments()
  },

  onTabChange(e) {
    const { value } = e.currentTarget.dataset
    const statusValue = value === '' ? '' : parseInt(value)
    this.setData({
      status: statusValue
    })
    this.filterAppointments()
  },

  // 查全部，不传status参数
  loadAppointments() {
    if (this.data.loading) return
    
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      this.setData({ appointments: [], allAppointments: [] })
      return
    }

    this.setData({ loading: true })
    
    request({
      url: '/api/appointment/list',
      data: {
        userId,
        page: 1,
        limit: 100 // 一次拿完所有
      }
    }).then(res => {
      const list = res.data.list || []
      this.setData({
        allAppointments: list,
        finished: true
      })
      this.filterAppointments()
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 前端根据状态筛选渲染
  filterAppointments() {
    const { status, allAppointments } = this.data
    let filtered = allAppointments
    
    if (status !== '') {
      filtered = allAppointments.filter(item => item.status == status)
    }
    
    this.setData({
      appointments: filtered
    })
  },

  cancelAppointment(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/api/appointment/cancel',
            method: 'POST',
            data: { id }
          }).then(() => {
            wx.showToast({ title: '取消成功', icon: 'success' })
            this.loadAppointments()
          })
        }
      }
    })
  },

  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/appointment-detail/appointment-detail?id=${id}`
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  onPullDownRefresh() {
    this.loadAppointments()
    wx.stopPullDownRefresh()
  }
})