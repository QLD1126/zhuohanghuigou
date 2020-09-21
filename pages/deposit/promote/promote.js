// miniprogram/pages/deposit/promote/promote.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    promote: [],
    userdata: '',
    wxaCode: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      wxaCode: wx.getStorageSync('wxaCode'),
    })
    this.getwxaCode()
    this.getSpeard()
  },
  onShow: function () {
  },
    //点击保存图片
    save() {
      let that = this
      //判断用户是否授权"保存到相册"
      wx.getSetting({
        success(res) {
          //没有权限，发起授权
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {//用户允许授权，保存图片到相册
                that.savePhoto();
              },
              fail() {//用户点击拒绝授权，跳转到设置页，引导用户授权
                wx.openSetting({
                  success() {
                    wx.authorize({
                      scope: 'scope.writePhotosAlbum',
                      success() {
                        that.savePhoto();
                      }
                    })
                  }
                })
              }
            })
          } else {//用户已授权，保存到相册
            that.savePhoto()
          }
        }
      })
    },
    //保存图片到相册，提示保存成功
    savePhoto() {
      let that = this
      wx.downloadFile({
        url: that.data.wxaCode,
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: "success",
                duration: 1000
              })
            }
          })
        }
      })
    },

  // 保存base64
  saveBase64() {
    var that = this
    var aa = wx.getFileSystemManager();//获取文件管理器对象
    // console.log('that.data.wxaCode:', that.data.wxaCode)
    aa.writeFile({
      filePath: wx.env.USER_DATA_PATH + '/zhpromote.png',
      data: that.data.wxaCode.slice(22),
      encoding: 'base64',
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: wx.env.USER_DATA_PATH + '/zhpromote.png',
          success: function (res) {
            wx.showToast({
              title: '保存成功',
            })
          },
          fail: function (err) {
            // console.log(err)
            wx.showModal({
              // cancelColor: 'cancelColor',
              // title:''
            })
          }
        })
        console.log(res)
      }, fail: err => {
        console.log(err)
      }
    })
  },
//获取用户推广信息
getSpeard() {
  app.$apis('/user/spread', 'GET', {}).then(
    res => {
      console.log('我的推广', res.data, res.data.data)
      let promote = res.data.data
      this.setData({
        promote: promote,
        // wxaCode:wx.getStorageSync('wxaCode')
      })
    }
  )
},
// 获取用户推广码+用户信息
getwxaCode() {
  app.$apis('/user', 'GET', {}).then(
    res => {
      console.log(res.data.data.spread_qr_img)
      wx.setStorageSync('wxaCode', res.data.data.spread_qr_img)
      this.setData({
        wxaCode:res.data.data.spread_qr_img,
        userdata:res.data.data          
      })
    }
  )
},
    // 保存图片
    downloadImg: function () {　　　　　　　　　　　　　　　　//触发函数
      console.log(111111)
      // console.log(e.currentTarget.dataset.url)
      var aa = wx.getFileSystemManager();//获取文件管理器对象
      wx.downloadFile({
        // url: this.data.wxaCode,
        url: wx.getStorageSync('wxaCode'),
        success: function (res) {
          console.log('存图', res)　　　　　　　//成功后的回调函数
          wx.saveImageToPhotosAlbum({　　　　　　　　　//保存到本地
            filePath: res.tempFilePath,
            // url:'../../../images/index/banner',
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1000
              })
            },
            fail: function (err) {
              if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                wx.openSetting({
                  success(settingdata) {
                    console.log(settingdata)
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                    } else {
                      console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                    }
                  }
                })
              }
            },
            complete: res => {
              // console.log(res)
            }
          })
        },
        complete: res => { console.log(res) }
      });
    },
  //获取access_token
  getToken() {
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      method: 'GET',
      data: {
        grant_type: 'client_credential',
        appid: 'wx18c0c4446acb2ec3',
        secret: '37c079830b07e80e02763dda6e2fbaab'
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: res => {
        // wx.setStorageSync('access_token', res.data.access_token)
        let access_token = res.data.access_token
        wx.request({
          url: 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=' + access_token,
          method: 'POST',
          responseType: 'arraybuffer',
          data: {
            path: "pages/index/index?uid=" + wx.getStorageSync('uid'),
            width: 200
          },
          success: (res) => {
            console.log('二维码', res.data)
            var base64 = wx.arrayBufferToBase64(res.data).replace(/\. +/g, '')
            base64 = base64.replace(/[\r\n]/g, '')
            wx.setStorageSync('wxaCode', 'data:image/png;base64,' + base64)
            this.setData({
              // wxaCode: 'data:image/png;base64,' + base64
              wxaCode: 'data:image/png;base64,' + base64
            })
          },
          complete: function (res) {
            // console.log('二维码', res.data)
          }
        })
      },
      complete: res => { console.log(res) }
    })
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
 
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中...',
    })
    setTimeout(() => {
      this.getwxaCode()
      this.getSpeard()
      this.setData({
        wxaCode: wx.getStorageSync('wxaCode'),
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