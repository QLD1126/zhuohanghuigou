// pages/prodetail/prodetail.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    pro: [],
    current: 0,
    banner: [],
    carCount: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCarCount()
    this.setData({
      id: options.id
    })
    console.log(this.data.id)
    this.swiperChange(e)
  },
  //点击指示点切换  
  swiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },
  // 跳转到购物车
  toCarpage() {
    wx.switchTab({
      url: '../car/car',
    })
  },
  // 添加到购物车
  toCar() {
    if(wx.getStorageSync('isLogin')){
    app.$apis('/cart/add', 'POST', {
      cartNum: 1,
      productId: this.data.id,
    }).then(
      res => {
        console.log(res)
        this.getCarCount()
        wx.showToast({
          title: '添加成功',
          icon: 'success',
        })
      }
    ), err => { console.log(err) }
    }else{
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  onShow: function () {
    this.getDetail()
  },
  // 获取购物车数量
  getCarCount() {
    app.$apis('/cart/count', 'GET', {}).then(
      res => {
        this.setData({
          carCount: res.data.data.count
        })
      }
    )
  },
  // 获取商品详情
  getDetail() {
    app.$apis('/product/detail/'+this.data.id, 'GET', {
      uuid:wx.getStorageSync('uuid')
    })
      .then(res => {
        console.log('详情', res.data)
        let pro = res.data.data
        // pro.description=pro.description.replace(/div/g,'view');
        // pro.description=pro.description.replace(/p/g,'view');
        // pro.description=pro.description.replace(/img/g,'image');
        this.setData({
          pro: pro
        })
        // console.log(this.data.id, this.data.pro.description)
      }), err => { console.log(err) }
  },
})