// pages/register/register.js
const { request } = require('../../utils/request')

Page({
  data: {
    username: '',
    phone: '',
    code: '',
    password: '',
    confirmPwd: '',
    nickname: '',
    countdown: 0,
    timer: null
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [field]: e.detail.value
    })
  },

  // 发送验证码
  sendCode() {
    const { phone, countdown } = this.data
    if (countdown > 0) return
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' })
      return
    }

    request({
      url: '/api/common/sendSms',
      method: 'POST',
      data: { phone }
    }).then(res => {
      wx.showToast({ title: '验证码已发送', icon: 'success' })
      // 模拟显示验证码（实际应该短信收到，这里为了调试方便）
      console.log('验证码:', res.data.code)
      this.setData({ code: res.data.code })
      
      this.setData({ countdown: 60 })
      this.data.timer = setInterval(() => {
        if (this.data.countdown <= 1) {
          clearInterval(this.data.timer)
        }
        this.setData({
          countdown: this.data.countdown - 1
        })
      }, 1000)
    })
  },

  // 注册
  doRegister() {
    const { username, phone, code, password, confirmPwd, nickname } = this.data
    
    if (!username.trim() || username.length < 3) {
      wx.showToast({ title: '用户名至少3位', icon: 'none' })
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' })
      return
    }
    if (!code) {
      wx.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    if (!password || password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    if (password !== confirmPwd) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    if (!nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    request({
      url: '/api/user/register',
      method: 'POST',
      data: { username, password, nickname, phone, code }
    }).then(() => {
      wx.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    })
  },

  onUnload() {
    if (this.data.timer) clearInterval(this.data.timer)
  }
})