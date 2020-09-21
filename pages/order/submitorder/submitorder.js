// miniprogram/pages/order/submitorder/submitorder.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cateId: '',//再来一单传过来的cateId
    addrID: '',//默认地址id
    nowAddrID: '',//重新选择的收货地址id
    carList: '',
    addr: '',//默认地址
    mark: '',//用户备注
    orderKey: '',//购物车页面传过来的orderKey
    cartInfo: [],//上页面传过来的购物车物品详情
    orderconfirm: {},//上个页面传过来的信息
    addressInfo: '',//收货地址信息
    cartInfo: '',//购物车数据
    priceGroup: '',//订单钱
    userInfo: '',//用户信息
    total_cart_num: '',//商品总数
    seconds:300,
    setInter:'',//定时器
    urltype: '',//页面条黄钻类型参数,决定返回到哪个页面  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setInterval()
    // let { addressInfo, cartInfo, priceGroup, orderKey, userInfo } = this.data.orderconfirm
    // if(!options.cateId){
    console.log(app.globalData.addrID,app.globalData.orderconfirm)
    this.setData({
      addrID: app.globalData.addrID,
      // orderconfirm: JSON.parse(options.orderconfirm),
      orderconfirm:JSON.parse(app.globalData.orderconfirm),
      // urltype:app.globalData.urltype
      // paytotal
    })
    console.log('传过来的订单详情', JSON.parse(options.orderconfirm))
    // console.log(this.data.id)
    
  },
  onShow: function () {
    console.log(app.globalData.nowAddrID,this.data.nowAddrID)
    let { addressInfo, cartInfo, priceGroup, orderKey, userInfo } = this.data.orderconfirm
    // 商品总数
    var total_cart_num = 0
    var totalMoney=(Number(priceGroup.depPrice)+Number(priceGroup.totalPrice)).toFixed(2)
    for (var item of cartInfo) {
      total_cart_num += item.cart_num
      // return total_cart_num
    }
    console.log(total_cart_num)
    this.setData({
      // orderconfirm: JSON.parse(options.orderconfirm),
      nowAddrID: app.globalData.nowAddrID,
      addressInfo: addressInfo,
      priceGroup: priceGroup,
      cartInfo: cartInfo,
      orderKey: orderKey,
      userInfo: userInfo,
      total_cart_num: total_cart_num,//商品总数
      totalMoney:totalMoney//总支付金额
    })
    // console.log(this.data.addressInfo,this.data.orderconfirm)
    if (this.data.nowAddrID !== 0) {
      // 不为0，选择了新地址，调用新地址
      this.getNewAddr()
    } else {//否则获取默认地址
      this.getDefaulrAddr()
    }
  },
  // 倒计时
  setInterval() {
    clearInterval(this.data.setInter)
    let seconds = this.data.seconds;
    let setInter = setInterval(() => {
      seconds -= 1
      this.setData({
        seconds: seconds,
        setInter:setInter
      })
      if (seconds <= 0) {
        clearInterval(setInter)
        wx.showToast({
          title: '订单已过期,请重新下单',
          icon:'none',
          success:res=>{
            wx.switchTab({
              url: '../../car/car',
            })
          }
        })
       
      } 
      // console.log(seconds)
    }, 1000)
  },
  // 留言
  getOrderMark(e) {
    let mark = e.detail.value
    this.setData({
      mark: mark
    })
    console.log('留言',this.data.mark)
  },
  // 订单创建完成(去支付)
  createOrder() {
    console.log(this.data)
    let orderKey = this.data.orderKey;
    let FormData = { mark: this.data.mark }
    if (this.data.nowAddrID) {
      FormData.addressId = this.data.nowAddrID
    } else {
      FormData.addressId = this.data.addressInfo.id
    }
    console.log(FormData, this.data.orderKey)
    app.$apis('/order/create/' + orderKey, 'POST', FormData).then(
      res => {
        console.log('创建订单成功,正在支付', res.data)
        let jsConfig = res.data.data.result.jsConfig
        this.setData({
          orderKey: res.data.data.result.orderId
        })
        let urlType=this.data.orderKey+'|pay'
        if (res.data.data.status == "WECHAT_PAY") {
          // app.$apis('')
          wx.requestPayment({
            // FormData,
            appId: jsConfig.appId,
            timeStamp: jsConfig.timestamp,
            nonceStr: jsConfig.nonceStr,
            package: jsConfig.package,
            signType: jsConfig.signType,
            paySign:jsConfig.paySign,
            success: res => {
              console.log(res)
              // console.log('支付结果', this.data.orderKey==res.data.data.result.orderId)
              wx.navigateTo({
                url: '../waitpay/waitpay?urlType=' +urlType,
              })
              // })
            },
            fail: err => {
              console.log(err)
              // setTimeout(() => {
                wx.navigateTo({
                  url: '../payfail/payfail?urlType=' +urlType,
                  // url: '../payfail/payfail?orderid=' + res.data.data.result.orderId,
                // }, 2001)
              })
            },
          })
        }
      }
    ), err => { console.error(err) }
  },
  // 获取默认地址
  getDefaulrAddr() {
    app.$apis('/address/default', 'GET', {}).then(
      res => {
        console.log('获取默认地址成功', res.data.data)
        let a = res.data.data;
        if (a.length == 0) {
          app.globalData.urltype='formsubmitorder'
          wx.navigateTo({
            // url: '../../addr/newaddr/newaddr',
          url: '../../addr/myaddr/myaddr?urltype=' + 'formsubmitorder',
          })
        } else {
          a.addr = a.province + a.city + a.district + a.location + a.detail
          this.setData({
            addr: a,
          })
        }
      }
    ), err => { console.log(error) }
  },
  // 获取单个地址(重新选择地址后)
  getNewAddr() {
    console.log('全局更新现选地址id', app.globalData.nowAddrID)
    app.$apis('/address/detail/' + app.globalData.nowAddrID, 'GET', {}).then(res => {
      let a = res.data.data;
      // a.addr = a.province + a.city + a.district + a.location + a.detail
      a.addr=a.location+a.detail
      this.setData({
        addr: a,
        nowAddrID: res.data.data.id
      })
      // app.globalData.nowAddrID=res.data.data.id
      console.log('更新收货地址成功', res.data.data,this.data.nowAddrID)
    }), err => { console.log(err) }
  },
  // 更改地址
  selectAddr() {
    app.globalData.urltype='formsubmitorder'
    console.log(11111,app.globalData.urltype)
    wx.navigateTo({
      url: '../../addr/myaddr/myaddr?urltype=' + 'formsubmitorder',
      // url:'../../addr/selectaddrmap/selectaddrmap'
    })
  },
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.setInter)
  },
})