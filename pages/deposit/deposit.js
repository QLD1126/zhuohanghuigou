// miniprogram/pages/deposit/deposit.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    limit: 8,
    hasMore: true,
    bottomCount: 0,//下拉次数
    isShow: false,
    currentTab: 1,//导航卡底标/押金类型
    dep_total: 0,//我的押金
    navbar: ['退押金', '已支付押金'],
    userInfo: wx.getStorageSync('userInfo'),//用户信息:总押金
    depList: [],//押金列表
    orderid: '',//要退的押金的orderid
    pullstatus: false,
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    // this.getDeposit()
    this.setData({
    })
  },
  onShow: function () {
    this.getProToTal()
    this.setData({
      userinfo: wx.getStorageSync('userInfo')
    })
  },
  onReady: function () {
    this.getDeposit()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  navbarTap(e) {
    this.setData({
      hasMore: true,
      // page:1,
      currentTab: e.currentTarget.dataset.idx,
      depList: []
    })
    this.getDeposit()
  },
  // 获取押金信息
  getDeposit() {
    this.setData({
      // depList: []
    })
    let query = {
      type: this.data.currentTab,
      // page: this.data.page,
      page: 1,
      limit: this.data.limit,
    }
    app.$apis('/order/dep/list', 'GET', query).then(
      res => {
        console.log('点击加载', res.data, query)
        let depList = res.data.data
        // wx.showLoading({
        //   title: '加载中...',
        //   duration: 1000,
        //   success: res => {
            if (depList.length == 0 || depList.length < this.data.limit) {
              this.setData({
                hasMore: false
              })
            }
            for (let item of depList) {
              item.add_time = app.$timeStamp.formatTime(item.add_time, 'Y/M/D h:m:s')
              item.dep_start_time = app.$timeStamp.formatTime(item.dep_start_time, 'Y/M/D h:m:s')
              item.dep_refund_time = app.$timeStamp.formatTime(item.dep_refund_time, 'Y/M/D h:m:s')
            }
            this.setData({
              depList: depList,
            })
        //   }
        // }
      }
    )
  },
  //触底,分类押金
  getCatrgoryDep() {
    let query = {
      type: this.data.currentTab,
      page: this.data.page,
      limit: this.data.limit,
    }
    app.$apis('/order/dep/list', 'GET', query).then(
      res => {
        console.log('触底加载', query, res.data.data)
        let depList = res.data.data
        let loadend = depList.length < this.data.limit
        console.log(this.data.depList)
        if (loadend) {
          wx.showToast({
            title: '已加载全部',
            icon: 'none',
            success: res => {
              this.setData({
                hasMore: false,
              })
            }
          })
        }
        console.log('还有数据', this.data.hasMore, res.data)
        for (let item of depList) {
          item.add_time = app.$timeStamp.formatTime(item.add_time, 'Y/M/D h:m:s')
          item.dep_start_time = app.$timeStamp.formatTime(item.dep_start_time, 'Y/M/D h:m:s')
          item.dep_refund_time = app.$timeStamp.formatTime(item.dep_refund_time, 'Y/M/D h:m:s')
        }
        this.setData({
          depList: this.data.depList.concat(depList),
        })
        wx.stopPullDownRefresh({
          success: (res) => {
            this.setData({
              pullstatus: false
            })
          },
        })
      }
      // }
    )
    console.log(this.data.depList)
  },
  // 获取用户的总押金额
  getProToTal() {
    app.$apis('/user', 'GET').then(
      res => {
        this.setData({
          dep_total: Number(res.data.data.orderStatusNum.depPrice).toFixed(2)
        })
        console.log(this.data.dep_total)
      }
    )
  },
  toRefund() {
    wx.navigateTo({
      url: '../deposit/refund/refund',
    })
  },
  // 退押金
  refundDeposit() {
    let orderid = this.data.orderid
    // orderid==
    console.log(orderid)
    app.$apis('/user/refund/dep' + orderid, 'GET', {}).then(
      res => {
        this.setData({
          isShow: false
        })
        if (res.data.status == 200) {
          console.log('退押金请求成功', res.data)
          this.setData({
            depList: []
          })
          let query = {
            type: this.data.currentTab,
            page: 1,
            limit: this.data.limit + this.data.limit * this.data.bottomCount,
          }
          this.getDeposit()
        }
      }
    ), err => { console.error(err) }

  },
  nodep() {
    wx.showToast({
      title: '暂无可退押金',
      icon: 'none'
    })
  },
  meShowModal(e) {
    if (this.data.currentTab !== 1) {
      console.log(e)
      console.log(e.currentTarget.dataset.orderid)
      let orderid = e.currentTarget.dataset.orderid
      orderid = orderid == undefined ? '' : '/' + orderid
      // if(orderid==)
      console.log(orderid)
      this.setData({
        isShow: true,
        orderid: orderid
      })
    }
  },
  getRes(a) {
    let res = a.currentTarget.dataset.res
    console.log(1111111111111, res)
    if (res == 'no') {
      this.setData({
        isShow: false
      })
    } else {
      this.refundDeposit()
    }
    // }
  },
  onPullDownRefresh: function () {
    this.setData({
      depList: [],
      pullstatus: true,
    })
    console.log('上拉拉', this.data.pullstatus)
    wx.showLoading({
      title: '加载中...',
      duration: 1000,
      success:res=>{
        setTimeout(() => {
          this.getProToTal()
          this.getDeposit()
          wx.hideLoading()
          wx.stopPullDownRefresh()
        }, 1000)
      }
    })
   
  },

  onReachBottom: function () {
    console.log('触底了', this.data.hasMore)
    // if(this.data.hasMore&&!this.data.pullstatus){
    if (this.data.hasMore && !this.data.pullstatus) {
      wx.showToast({
        title: '加载中...',
        icon: 'loading',
        success: res => {
          this.setData({
            bottomCount: this.data.bottomCount + 1,
            page: this.data.page + 1
          }),
            this.getCatrgoryDep()
        }
      })
    } else {
      wx.showToast({
        title: '已加载全部',
        icon: 'none'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})