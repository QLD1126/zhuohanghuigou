// pages/medetail/medetail.js
const app = getApp()
Page({
  data: {
    nickName:'',
    userInfo: [],
    phone: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      nickName:wx.getStorageSync('nickName'),
      userInfo:wx.getStorageSync('userInfo'),
      phone: wx.getStorageSync('phone')
    })
    console.log(this.data.phone)
  },
  //获取用户手机号
  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      console.log(e.detail)
      wx.login({
        success: res => {
          let jsCode = res.code
          app.$apis('/wechat/mp_auth', 'POST', {
            pid:wx.getStorageSync('pid'),//上级推广员的uid
            jsCode: jsCode,
            iv: wx.getStorageSync('iv'),
            encryptedData: wx.getStorageSync('encryptedData'),
            uuid: wx.getStorageSync('uuid')
          }).then(res => {
            console.log('用户登录后的信息', res)
            wx.setStorageSync('cache_key', res.data.data.cache_key)
            wx.setStorageSync('token', res.data.data.token)
            let cache_key=res.data.data.cache_key
            if (res.data.status == 200) {
              let FormData = {
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                // cache_key: wx.getStorageSync('cache_key'),
                cache_key:cache_key
              }
              app.$apis('/wechat/decryptData', 'POST', FormData).then(
                res => {
                  console.log('用户手机号', res)
                  wx.setStorageSync('phone', res.data.data.phoneNumber)
                  this.setData({
                    phone: res.data.data.phoneNumber
                  })
                }, err => {
                  console.log(err)
                }
              )
            }
          })

        }
      })

    }
  },
  // 修改用户名称
  setNickname(e) {
    let newNick = e.detail.value
    app.$apis('/user/edit', 'POST', {
      nickname: newNick
    }).then(
      res => {
        wx.setStorageSync('nickName', newNick.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "**"))
        console.log('昵称修改成功', res.data)
      }
    )
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // wx.redirectTo({
    // url: '../me',
    // })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})