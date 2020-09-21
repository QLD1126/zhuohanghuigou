// miniprogram/pages/customer/customer.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      phone: wx.getStorageSync('userInfo').pay_auth_phone
    })
  },
  onShow: function () {
    this.kf()
  },
  kf() {
    app.$apis('/article/details/kf', 'GET', { key: 'kf' }).then(
      res => {
        console.log(11111111, res.data)
        this.setData({
          content:res.data.data.content
        })
        console.log(this.data.content)
      }
    )
  },
  call() {
    console.log('打电话')
    wx.makePhoneCall({
      phoneNumber: this.data.phone,
    })
  }

})