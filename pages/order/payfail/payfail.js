// miniprogram/pages/order/payfail/payfail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlType:'',
    seconds: 5,
    setInter:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      urlType:options.urlType
    })
    console.log('从创建订单页传来的orderID', options)
    this.setInterval()
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
        this.leave()
      } 
      console.log(seconds)
    }, 1000)
  },
  // 跳转
  leave() {
    console.log('跳转',this.data.urlType)
    wx.navigateTo({
      url: '../waitpay/waitpay?urlType='+this.data.urlType,
    })
  },
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.setInter)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.setInter)
    wx.reLaunch({
      url: '../../index/index'
    })
  },
})