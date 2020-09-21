// pages/me/me.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canPhone: true,//可以获取手机号
    isLogin: false,
    shouNum: 0,
    waitpayNum: 0,
    nickName: wx.getStorageSync('nickName'),
    avatarUrl:wx.getStorageSync('avatarUrl'),
    userinfo: '',
    // is_promoter: wx.getStorageSync('userInfo').is_promoter,//是否为推广人员
    isShow: false
  },
  onLoad: function (options) {
    this.checksession()
    // this.getUser()
    app.globalData.urltype = 'fromMe'
    console.log(22222222222,app.globalData.urltype)
    this.setData({
      // is_promoter: wx.getStorageSync('userInfo').is_promoter,//是否为推广人员
      urltype: 'fromMe'
    })
  },
  onShow: function () {
    this.getUser()
    this.getUserInfo()
    this.setData({
      nickName: wx.getStorageSync('nickName'),
      avatarUrl:wx.getStorageSync('avatarUrl')
    })
    console.log(11111111111, this.data.userinfo)
  },
  // 判断用户登录状态是否过期
  checksession() {
    if (wx.getStorageSync('token').length == 0) {
      console.log('第一次')
      this.setData({
        isLogin: false
      })
    } else {
      console.log('不是第一次')
      wx.login({
        success: res => {
          let jsCode = res.code
          let FormData = {
            pid:wx.getStorageSync('pid'),//上级推广员的uid
            iv: wx.getStorageSync('iv'),
            jsCode: jsCode,
            cache_key: wx.getStorageSync('cache_key'),
            encryptedData: wx.getStorageSync('encryptedData'),
            uuid: wx.getStorageSync('uuid')
          }
          console.log(FormData)
          app.$apis('/wechat/mp_auth', 'POST', FormData).then(
            res => {
              console.log('用户登录是否过期', res.data)
              // 返回的token与本地缓存是否一致
              if (res.data.status !== 200) {
                // 已过期或登录失败
                console.log('登录已过期')
                this.setData({
                  isLogin: false
                })
              } else {
                // 未过期
                wx.setStorageSync('token',res.data.data.token)
                wx.setStorageSync('isLogin', true)
                console.log('登录未过期')
                this.setData({
                  isLogin: true
                })
                this.getUser()
              }
            }
          )
        }
      })
    }
  },
  // 授权登录
  bindGetUserInfo: function (e) {
    wx.getSetting({
      success: (res) => {
        console.log('wx.getSetting', res)
        if (res.authSetting['scope.userInfo']) {
          console.log('点击授权', res)
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: (res) => {
              console.log('wx.getUserInfo', res, JSON.parse(res.rawData))
              wx.setStorageSync('iv', res.iv)
              wx.setStorageSync('encryptedData', res.encryptedData)
              wx.setStorageSync('avatarUrl',res.userInfo.avatarUrl)
              wx.setStorageSync('nickName', res.userInfo.nickName.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "**"))
              this.setData({
                nickName:res.userInfo.nickName.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "**"),
                avatarUrl:res.userInfo.avatarUrl
              })
              this.goLogin()
            }
          })
        }
      }
    })
  },
  // 用户登录
  goLogin() {
    wx.login({
      success: res => {
        let jsCode = res.code
        console.log('jscode', jsCode)
        app.$apis('/wechat/mp_auth', 'POST', {
          pid:wx.getStorageSync('pid'),//上级推广员的uid
          jsCode: jsCode,
          iv: wx.getStorageSync('iv'),
          encryptedData: wx.getStorageSync('encryptedData'),
          uuid: wx.getStorageSync('uuid')
          // cache_key: wx.getStorageSync('cache_key'),
        }).then((res) => {
          console.log('用户登录后的信息', res)
          if (res.data.status == 200) {
            this.setData({
              canPhone: false
            })
            setTimeout(()=>{
              this.getUser()
              this.getUserInfo()
            },100)
            wx.setStorageSync('uid', res.data.data.userInfo.uid)//用户自己的uid
            wx.setStorageSync('cache_key', res.data.data.cache_key)
            wx.setStorageSync('token', res.data.data.token)
            wx.setStorageSync('userInfo', res.data.data.userInfo)
            wx.setStorageSync('nickName', res.data.data.userInfo.nickname)
            wx.setStorageSync('isLogin', true)
          }
        }), err => {
          console.log(err)
        }
      }
    })
  },
  //获取用户手机号
  getPhoneNumber(e) {
    // 测试
    // this.setData({
    //   canPhone:false
    // })
    console.log(e.detail)
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      this.goLogin()
      let FormData = {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        cache_key: wx.getStorageSync('cache_key'),
      }
      app.$apis('/wechat/decryptData', 'POST', FormData).then(
        res => {
          console.log('用户手机号', res)
          wx.setStorageSync('phone', res.data.data.phoneNumber)
          // this.setData({
          //   isLogin: true,
          // })
        }, err => {
          console.log(err)
        }
      )
    }
    this.setData({
      isLogin: true,
    })
  },
  getUserInfo(){
    app.$apis('/userinfo','GET',{}).then(
      res=>{
        console.log('userinfo用户信息',res.data)
        if(res.data.msg=='ok'){
          let userInfo=res.data.data
          wx.setStorageSync('userInfo',userInfo)
        }
      }
    )
  },
  // 获取用户信息
  getUser() {
    app.$apis('/user', 'GET', {}).then(
      res => {
        if (res.data.msg == 'ok') {
          console.log('获取用户信息成功', res.data)
          let userinfo = res.data.data
          let orderStatusNum = res.data.data.orderStatusNum
          let waitpayNum = orderStatusNum.unpaid_count;
          let shouNum = orderStatusNum.received_count;
          this.setData({
            userinfo: userinfo,
            waitpayNum: waitpayNum,
            shouNum: shouNum
          })
          // console.log(1111111, this.data.shouNum)
          // wx.setStorageSync('userInfo.', data)
        }
      }
    ), err => { console.error(err) }
  },
  toPromote() {
    console.log(this.data.is_promoter)
    // if (this.data.is_promoter == 1) {
      wx.navigateTo({
        url: '../deposit/promote/promote',
      })
    // }
  },
  getRes() {
    this.setData({
      isShow: false
    })
  },
  // 跳转
  editMedetail() {
    wx.navigateTo({
      url: '../me/medetail/medetail',
    })
  },
  waitpay() {//待付款
    wx.navigateTo({
      url: '../order/myorder/myorder?orderType=' + 0,
    })
  },
  waitAccept() {
    wx.navigateTo({//配送中,待收货
      url: '../order/myorder/myorder?orderType=' + 1,
    })
  },
  Complate() {
    wx.navigateTo({//已完成
      url: '../order/myorder/myorder?orderType=' + 2,
    })
  },
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中...',
      icon: 'loading',
    })
    setTimeout(() => {
      this.getUser()
      this.setData({
        nickName: wx.getStorageSync('nickName')
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }, 1000)
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