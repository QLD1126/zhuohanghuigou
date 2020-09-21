//app.js
import $apis from "./utils/api";
import $timeStamp from './utils/timeStamp'
App({
  onLaunch: function () {
    var that = this;
  },
  onShow: function (options) {
    console.log('来源', options)
    if (options.scene) {
      //扫描小程序码进入 -- 解析携带参数
      var scene = decodeURIComponent(options.scene);
      // console.log("scene is ", scene);
      var uid = options.query.scene ? options.query.scene : ''
      // 被uid推广来的
      wx.setStorageSync('pid', uid)
    }
  },
  globalData: {
    orderconfirm: '',// 创建订单详情
    urltype: '',//收货地址
    cate_id_index: 0,//商品分类下标
    cate_id: 7,//品类
    addrID: '',//默认收货地址id
    nowAddrID: 0,//当前收货地址id
    is_pay: false//是否允许购买商品
  },
  $apis: $apis,
  $timeStamp: $timeStamp
})