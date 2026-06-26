// pages/index/index.js
const { request } = require('../../utils/request')

// 引入高德微信小程序SDK
// 引入高德微信小程序SDK
const amapFile = require('../../utils/amap-wx.130.js')
const AMAP_KEY = '51d6f8ffcc4d4fc71e10b2caa689cc9f'

Page({
  data: {
    location: {
      city: '定位中...',
      address: '正在获取位置'
    },
    categories: [],
    banners: [],
    hotServices: [],
    hasLocation: false,
    locationAuth: false,
    searchKeyword: '',
    searchResults: [],
    searchTotal: 0,
    searchPage: 1,
    searchLimit: 10,
    searchHasMore: false,
    isSearching: false,
    cateIndex: 0,
    cateOptions: [{ id: '', name: '全部分类' }],
    sortIndex: 0,
    sortOptions: [
      { sortBy: 'id', sortOrder: 'desc', label: '默认排序' },
      { sortBy: 'price', sortOrder: 'asc', label: '价格从低到高' },
      { sortBy: 'price', sortOrder: 'desc', label: '价格从高到低' },
      { sortBy: 'createTime', sortOrder: 'desc', label: '最新发布' }
    ]
  },

  onLoad() {
    this.getLocationAuth()
    this.loadBanners()
    this.loadCategories()
    this.loadHotServices()
  },

  onShow() {
    if (this.data.hasLocation) {
      this.loadHotServices()
    }
  },

  loadCategories() {
    request({
      url: '/api/category/list',
      method: 'GET',
      data: { sortBy: 'sort', sortOrder: 'asc' }
    }).then(res => {
      const list = res.data || []
      const categories = list.map(item => ({
        id: item.id,
        name: item.cateName,
        icon: item.icon
      }))
      const cateOptions = [{ id: '', name: '全部分类' }, ...categories]
      this.setData({ categories, cateOptions })
    }).catch(() => {
      this.setData({ categories: [] })
    })
  },

  getLocationAuth() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          this.doGetLocation()
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => { this.doGetLocation() },
            fail: () => {
              this.setData({
                location: { city: '未授权', address: '点击授权获取位置' },
                locationAuth: false,
                hasLocation: false
              })
              wx.showModal({
                title: '需要位置权限',
                content: '获取位置后才能展示附近服务，是否去设置？',
                success: (res) => { if (res.confirm) wx.openSetting() }
              })
            }
          })
        }
      }
    })
  },

  reGetLocation() {
    this.getLocationAuth()
  },

  doGetLocation() {
    const myAmapFun = new amapFile.AMapWX({ key: AMAP_KEY })
    myAmapFun.getRegeo({
      success: (data) => {
        const res = data[0]
        const regeocode = res.regeocodeData || res
        const ac = regeocode.addressComponent || {}
        let city = ac.city
        if (!city || (Array.isArray(city) && city.length === 0)) city = ac.province
        if (Array.isArray(city)) city = city[0] || ac.province
        this.setData({
          location: {
            city: city,
            address: res.desc || res.formatted_address || '当前位置',
            latitude: res.latitude,
            longitude: res.longitude
          },
          hasLocation: true,
          locationAuth: true
        })
        getApp().globalData.location = {
          latitude: res.latitude,
          longitude: res.longitude
        }
      },
      fail: (err) => {
        console.log('高德SDK失败:', err)
        wx.getLocation({
          type: 'gcj02',
          success: (res) => {
            this.setData({
              location: {
                city: '当前城市',
                address: `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`
              },
              hasLocation: true,
              locationAuth: true
            })
            getApp().globalData.location = {
              latitude: res.latitude,
              longitude: res.longitude
            }
          }
        })
      }
    })
  },

  goNearby() {
    const loc = getApp().globalData.location
    if (!loc) {
      wx.showToast({ title: '请先获取定位', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/nearby/nearby?longitude=${loc.longitude}&latitude=${loc.latitude}`
    })
  },

  loadBanners() {
    request({
      url: '/api/service/banner',
      method: 'GET'
    }).then(res => {
      this.setData({ banners: res.data || [] })
    }).catch(() => {
      this.setData({ banners: [] })
    })
  },

  loadHotServices() {
    request({
      url: '/api/service/list',
      method: 'GET',
      data: { hot: 1, limit: 6 }
    }).then(res => {
      this.setData({ hotServices: res.data.list || [] })
    })
  },

  onCategoryTap(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/service-list/service-list?cateId=${id}&cateName=${name}`
    })
  },

  onBannerTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${id}`
    })
  },

  onHotServiceTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${id}`
    })
  },

  quickBook() {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/login/login' })
      }, 1000)
      return
    }
    wx.showToast({ title: '请在服务列表选择服务', icon: 'none' })
  },

  onPullDownRefresh() {
    this.loadBanners()
    this.loadCategories()
    this.loadHotServices()
    wx.stopPullDownRefresh()
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onCateChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({ cateIndex: index })
    this.doSearch()
  },

  onSortChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({ sortIndex: index })
    this.doSearch()
  },

  doSearch() {
    const { searchKeyword, cateIndex, cateOptions, sortIndex, sortOptions, searchLimit } = this.data
    const cateId = cateOptions[cateIndex].id
    const sort = sortOptions[sortIndex]
    this.setData({
      searchPage: 1,
      searchResults: [],
      isSearching: true
    })
    const params = {
      page: 1,
      limit: searchLimit,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder
    }
    if (searchKeyword) params.keyword = searchKeyword
    if (cateId) params.cateId = cateId
    request({
      url: '/api/service/list',
      method: 'GET',
      data: params
    }).then(res => {
      const data = res.data || {}
      this.setData({
        searchResults: data.list || [],
        searchTotal: data.total || 0,
        searchHasMore: data.page < data.totalPages
      })
    }).catch(() => {
      this.setData({ searchResults: [], searchTotal: 0 })
    })
  },

  loadMoreSearch() {
    const { searchPage, searchLimit, searchKeyword, cateIndex, cateOptions, sortIndex, sortOptions, searchHasMore } = this.data
    if (!searchHasMore) return
    const nextPage = searchPage + 1
    const cateId = cateOptions[cateIndex].id
    const sort = sortOptions[sortIndex]
    const params = {
      page: nextPage,
      limit: searchLimit,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder
    }
    if (searchKeyword) params.keyword = searchKeyword
    if (cateId) params.cateId = cateId
    request({
      url: '/api/service/list',
      method: 'GET',
      data: params
    }).then(res => {
      const data = res.data || {}
      this.setData({
        searchResults: [...this.data.searchResults, ...(data.list || [])],
        searchPage: nextPage,
        searchHasMore: nextPage < data.totalPages
      })
    })
  }
})