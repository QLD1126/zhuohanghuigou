// pages/waitpay/waitpay.js
const app = getApp()
Page({
  data: {
    orderid: '',
    timer: null,//定时器,
    timers: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(getDate())
    console.log('从订单列表页传过来的orderid订单号', options.orderid)
    if (options.urlType) {
      console.log(options.urlType)
      let arr = options.urlType.split('|')
      this.setData({
        orderid: arr[0],
        url: arr[1]
      })
      console.log(arr)
    }else{
      this.setData({
        orderid:options.orderid
      })
    }
  },
  onShow: function () {
    // console.log(this.data.orderList)
    this.getOrderDetail()
    // this.endTime()
  },
  // 获取订单详情
  getOrderDetail() {
    app.$apis('/order/detail/' + this.data.orderid, 'GET', {}).then(
      res => {
        console.log('订单详情获取成功', res.data.data)
        let a = res.data.data
        if (a._status._type == 0) {
          let endTime = parseInt(a._status._msg) 
          console.log(endTime)
          var timers = setInterval(() => {
            let nowTime = parseInt(Date.parse(new Date()) / 1000)
            let leftTime = parseInt(endTime - nowTime);//时间差值
            // console.log(111111111,new Date(),nowTime,endTime,leftTime)
            // 转换成小时,分钟等
            // let d = parseInt(leftTime / (24 * 60 * 60))
            // let h = parseInt(leftTime / (60 * 60) % 24)
            let m = parseInt(leftTime / 60 % 60)
            m = m < 10 ? m : m + ''
            let s = parseInt(leftTime % 60)
            s = s < 10 ? '0' + s : s + ''
            let downTime = m + '：' + s
            a._status._msg = downTime
            // if(leftTime>1){
            this.setData({
              orderList: a,
              timers: timers
            })
            if (leftTime <=18 ) {
              // console.log('定时器已关闭')
              clearInterval(timers)
              this.getOrderDetail()
            }
          }, 1000);
        }
        this.setData({
          orderList: res.data.data,
        })
      }
    )
  },
  // 立即支付
  payOrder() {
    let order_id = this.data.orderList.order_id
    console.log(order_id)
    app.$apis('/order/pay', 'POST', {
      uni: order_id
    }).then(
      res => {
        console.log('去支付了', res.data)
        let jsConfig = res.data.data.result.jsConfig
        this.setData({
          orderid: res.data.data.result.order_id
        })
        console.log(this.data.order_id)
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
          // app.$apis('')
          wx.requestPayment({
            // FormData,
            appId: jsConfig.appId,
            timeStamp: jsConfig.timestamp,
            nonceStr: jsConfig.nonceStr,
            package: jsConfig.package,
            signType: jsConfig.signType,
            paySign: jsConfig.paySign,
            success: res => {
              console.log('支付结果', res)
              wx.navigateTo({
                url: '../waitpay/waitpay?orderid=' + res.data.data.result.orderId,
              })
            },
            fail: err => {
              console.log('支付参数', FormData)
              console.log(err)
              setTimeout(() => {
                // wx.navigateTo({
                //   url: '../payfail/payfail?orderid=' + this.data.orderid,
                // }, 2001)
              })
            },
            complete: res => { console.log(res, '支付参数', FormData) }
          })
        }
      }
    ), err => { console.error(err) }
  },
  // 再来一单
  againOrder() {
    app.$apis('/order/again', 'POST', {
      uni: this.data.orderList.order_id
    }).then(
      res => {
        console.log('再来一单', res.data, this.data.orderList.order_id)
        // console.log('再来一单',res.data)
        let cateId = res.data.data.cateId
        app.$apis('/order/confirm', 'POST', {
          cartId: cateId
        }).then(
          res => {
            console.log('新创建订单成功', res.data)
            let orderconfirm=JSON.stringify(res.data.data)
            app.globalData.orderconfirm=orderconfirm
            wx.navigateTo({
              url: '../submitorder/submitorder?orderconfirm=' + orderconfirm,
            })
          }
        )
      }
    )
  },
  // 弹窗
  meShowModal() {
    this.setData({
      isShow: true
    })
    // console.log('出弹窗',this.data.isShow,this.meShowModal)
  },
  // 隐藏静态对话框
  meHideModal() {
    this.setData({
      isShow: false
    })
    console.log('组件已隐藏')
  },
  // 取消订单弹窗
  getRes(e) {
    let status = e.currentTarget.dataset.res;
    let order_id = e.currentTarget.dataset.orderid;
    if (status == 'no') {
      console.log('用户点击了取消')
      // this.meHideModal()
      this.setData({
        isShow: false
      })
    } else {
      app.$apis('/order/cancel', 'POST', {
        id: order_id
      }).then(
        res => {
          console.log('订单已取消', res.data)
          this.setData({
            isShow: false
          })
          clearInterval(this.data.timers)
          this.getOrderDetail()
        }
      )
    }
  },
  onHide: function () {
    clearInterval(this.data.timers)
  },
  onUnload: function () {
    clearInterval(this.data.timers)
    console.log(22222222222,this.data.url)
    // 从订单详情页返回
    if (this.data.url == 'pay') {
      wx.reLaunch({
        url: '../../index/index'
      })
    }

  },
})