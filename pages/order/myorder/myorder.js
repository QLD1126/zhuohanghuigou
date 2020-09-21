// pages/myorder/myorder.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderType: 10,
    currentTab: 0,
    page: 1,//加载页
    limit: 8,
    hasMore: true,
    hasMore: true,//还有等多的数据
    navbar: ['全部', '待付款', '待收货', '已完成'],
    orderList: [],//全部
    pullstatus: false,
  },
  onLoad: function (options) {
    this.setData({
      orderType: options.orderType
    })
    let orderType = this.data.orderType
    // 控制显示那一类型订单
    let currentTab = this.data.currentTab
    if (orderType == 0) {
      currentTab = 1
    } else if (orderType == 1) {
      currentTab = 2
    } else if (orderType == 2) {
      currentTab = 3
    } else {
      currentTab = 0
    }
    this.setData({
      currentTab: currentTab
    })
    // console.log('我的页面传来的参数', options.orderType)
  },
  onShow: function () {
    this.getCatogryuOrder()
    console.log(this.data.orderType)
  },

  navbarTap(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      page: 1,
      hasMore: true,
      orderList: [],

    })
    console.log(this.data.currentTab)
    this.getCatogryuOrder()
  },
  //点击专用
  getCatogryuOrder() {
    this.setData({
      // orderList: [],
    })
    let currentTab = this.data.currentTab
    let query = {
      page: 1,
      limit: this.data.limit,
    }
    if (currentTab !== 0) {
      query.type = currentTab - 1
    }
    console.log('点击分类加载参数', query)
    app.$apis('/order/list', 'GET', query).then(
      res => {
        console.log('点击分类加载', res.data)
        let orderList = res.data.data
        let loadend = res.data.data.length < this.data.limit
        // wx.showLoading({
        //   title: '加载中...',
        //   duration: 1000,
        //   success: res => {
        if (orderList.length == 0 || loadend) {
          this.setData({
            hasMore: false,
          })
        }
        this.setData({
          orderList: orderList
        })
        //   }
        // })
      }
    )
  },
  // 触底专用
  getOrderList() {
    let query = {
      limit: this.data.limit,
      page: this.data.page,
    }
    if (this.data.currentTab !== 0) {
      query.type = this.data.currentTab - 1
    }
    console.log('触底加载', query)
    app.$apis('/order/list', 'GET', query).then(
      res => {
        console.log('获取订单信息成功', res.data.data)
        let orderList = res.data.data
        let loadend = orderList.length < this.data.limit
        if (orderList.length == 0 || loadend) {
          this.setData({
            hasMore: false
          })
        }
        console.log(orderList)
        this.setData({
          orderList: this.data.orderList.concat(orderList)
        })
        wx.stopPullDownRefresh({
          complete: () => {
            this.setData({
              pullstatus: false //最后还原该状态
            })
          }
        });
      }
    )
  },
  // 跳转到详情页
  goOrderdetail(e) {
    wx.navigateTo({
      url: '../waitpay/waitpay?orderid=' + e.currentTarget.dataset.orderid,
    })
  },
  // 再来一单
  againOrder(e) {
    // let =e.currentTarget
    let order_id = e.currentTarget.dataset.orderid
    console.log('再来一单的', order_id)
    app.$apis('/order/again', 'POST', {
      uni: order_id
    }).then(
      res => {
        console.log('再来一单', res.data)
        let cateId = res.data.data.cateId
        app.$apis('/order/confirm', 'POST', {
          cartId: cateId
        }).then(
          res => {
            console.log('新创建订单成功', res.data)
            let orderconfirm = JSON.stringify(res.data.data)
            app.globalData.orderconfirm = orderconfirm
            wx.navigateTo({
              url: '../submitorder/submitorder?orderconfirm=' + orderconfirm,
            })
          }
        )
      }
    )
  },
  // 立即支付
  payOrder(e) {
    let order_id = e.currentTarget.dataset.orderid
    app.$apis('/order/pay', 'POST', {
      uni: order_id
    }).then(
      res => {
        console.log('去支付了', res.data)
        let jsConfig = res.data.data.result.jsConfig
        this.setData({
          orderKey: res.data.data.result.order_id
        })
        let urlType = this.data.orderKey + '|pay'
        if (res.data.data.status == "WECHAT_PAY") {
          let FormData = {
            appId: jsConfig.appId,
            timeStamp: jsConfig.timestamp,
            nonceStr: jsConfig.nonceStr,
            package: jsConfig.package,
            signType: jsConfig.signType,
            paySign: jsConfig.paySign
          }
          console.log(FormData)
          wx.requestPayment({
            appId: jsConfig.appId,
            timeStamp: jsConfig.timestamp,
            nonceStr: jsConfig.nonceStr,
            package: jsConfig.package,
            signType: jsConfig.signType,
            paySign: jsConfig.paySign,
            success: res => {
              console.log('支付结果', res)
              wx.navigateTo({
                url: '../waitpay/waitpay?urlType=' + urlType,
              })
            },
            fail: err => {
              console.log(err)
              wx.navigateTo({
                url: '../payfail/payfail?urlType=' + urlType,
              })
            },
          })
        }
      }
    ), err => { console.error(err) }
  },
  // 取消订单
  cancelOrder(e) {
    let order_id = e.currentTarget.dataset.orderid
    app.$apis('/order/cancel', 'POST', {
      id: order_id
    }).then(
      res => {
        console.log('取消订单请求', res.data)
        wx.navigateTo({
          url: '../waitpay/waitpay?orderid=' + order_id,
        })
      }
    )
  },
  //下滑刷新
  onPullDownRefresh: function () {
    this.setData({
      pullstatus: true,
      orderList: [],
    })
    wx.showLoading({
      title: '加载中...',
      icon: 'loading',
      duration: 1000,
      success: res => {
        setTimeout(() => {
          this.getCatogryuOrder()
          wx.hideLoading()
          wx.stopPullDownRefresh()
        }, 500)
      }
    })


  },
  // 触底加载
  onReachBottom: function () {
    console.log(';触底---------------', this.data.hasMore)
    //没有下拉状态才进行加载数据
    if (this.data.hasMore && !this.data.pullstatus) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        success: res => {
          this.setData({
            page: this.data.page + 1
          })
          this.getOrderList()
          console.log('触底了', this.data.page, this.data.limit)
        }
      })
    } else {
      wx.showToast({
        title: '已加载全部',
        icon: 'none',
      })
    }
  },
  onHide: function () {
    console.log('页面隐藏', this.data.waitpay)
    this.setData({
      orderList: [],//全部
    })
  },
  onUnload: function () {
    console.log('页面隐藏', this.data.waitpay, this.data.orderList)
    this.setData({
      orderList: [],//全部
    })
  }
})
