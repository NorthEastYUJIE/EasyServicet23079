// pages/appointment/appointment.js
const { request } = require('../../utils/request')

Page({
  data: {
    serviceId: '',
    service: null,
    username: '',
    phone: '',
    orderTime: '',
    timeSlot: '',
    remark: '',
    dateArray: [],
    timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '19:00-20:00', '20:00-21:00'],
    timeSlotIndex: -1,
    minDate: '',
    maxDate: ''
  },

  onLoad(options) {
    const { serviceId } = options
    this.setData({ serviceId })
    this.loadServiceDetail(serviceId)
    this.initDate()
    
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        username: userInfo.nickname || '',
        phone: userInfo.phone || ''
      })
    }
  },

  initDate() {
    const today = new Date()
    const minDate = this.formatDate(today)
    const max = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const maxDate = this.formatDate(max)
    
    const dateArray = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      dateArray.push(this.formatDate(d))
    }
    
    this.setData({ minDate, maxDate, dateArray })
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  loadServiceDetail(id) {
    request({
      url: '/api/service/detail',
      data: { id }
    }).then(res => {
      this.setData({ service: res.data })
    })
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },

  onDateChange(e) {
    this.setData({
      orderTime: this.data.dateArray[e.detail.value]
    })
  },

  onTimeChange(e) {
    this.setData({
      timeSlotIndex: e.detail.value,
      timeSlot: this.data.timeSlots[e.detail.value]
    })
  },

  // 提交预约 - 状态流转：提交后默认状态为"待确认"（status=0）
  submitAppointment() {
    const { username, phone, orderTime, timeSlot, remark, service } = this.data
    const userId = wx.getStorageSync('userId')

    if (!username.trim()) {
      wx.showToast({ title: '请输入联系人姓名', icon: 'none' })
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' })
      return
    }
    if (!orderTime) {
      wx.showToast({ title: '请选择预约日期', icon: 'none' })
      return
    }
    if (!timeSlot) {
      wx.showToast({ title: '请选择时间段', icon: 'none' })
      return
    }

    const data = {
      userId,
      serviceId: service.id,
      serviceName: service.serviceName,
      coverUrl: service.coverUrl,
      username,
      phone,
      orderTime,
      timeSlot,
      remark: remark || '',
      status: 0,  // 明确传status=0，默认状态"待确认"
      createTime: new Date().toLocaleString()
    }

    request({
      url: '/api/appointment/add',
      method: 'POST',
      data
    }).then(() => {
      wx.showToast({ title: '预约成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    })
  }
})