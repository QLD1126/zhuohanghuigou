// pages/newaddr/newaddr.js
const app = getApp()
const QQMapWX = require('../../../libs/qqmap-wx-jssdk');
var qqmapsdk = new QQMapWX({
  key: 'XOLBZ-KEWKO-BGYWD-SREHQ-JR3YV-D2FR3'
  // key:'HIMBZ-S3J3X-5TD4K-76CR5-H4HJS-RGB2U'

})
Page({
  data: {
    nowAddrID: '',//列表页传过来的id
    FormData: {},//地图页传过来的详情对象
    mapaddressStr: '',//地址页传过来处理后的数据
    addrID: '',//设置默认地址
    addr: '',//地址详细信息
    //表单信息
    real_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',//后台省市区（定位）
    detail: '',//手输
    is_default: false,//是否设置为默认地址
    // 缓存信息
    stroageaddr: '',//缓存处理后的数据
    cityId: '',//用户区编号
    myLatitude: "",
    myLongitude: "",
    myAddress: "",
    // handLose: false,//是否手动输入过
    FisKong: true,
    localCity: '',//定位城市
  },
  onLoad: function (options) {

    //订单提交页,地址新增页,地图页
    console.log(options)
    // nowAddrID不存在说明是新增地址,所以无ID
    if (!options.nowAddrID) {
      // 初始进入地址新增页
      if (!options.FormData) {
        console.log('未进入地图页新增地址')
        // 如果没有传进来id，则是新增地址
        this.setData({
          addrID: app.globalData.addrID,//设置默认地址用
          // nowAddrID:'',
        })
        this.getUserLocation()//页面加载显示当前位置
        setTimeout(() => {
          if (wx.getStorageSync('city') == this.data.localCity) {
            this.getnowP()
          }
        }, 1000)
      } else {
        console.log('地图页选完地址')
        // let mapaddressStr = ''
        let FormData = JSON.parse(options.FormData)
        let mapaddressStr=FormData.province+FormData.city+FormData.district+FormData.location
        // let mapaddressStr=FormData.location
        this.setData({
          mapaddressStr: mapaddressStr,
          // mapaddressStr:FormData.location
          FormData: FormData,
          // nowAddrID:'',
        })
        if (FormData.nowAddrID) {
          // this.getAddr()
          this.setData({
            nowAddrID: FormData.nowAddrID
          })
        }

        console.log(this.data.FormData, this.data.mapaddressStr, this.data.nowAddrID)
      }
    } else {
      console.log('有nowAddrID', options.nowAddrID)
      this.setData({
        nowAddrID: options.nowAddrID,
        addrID: app.globalData.addrID,//设置默认地址用
      })
      this.getAddr()
    }
    console.log(this.data.nowAddrID)
  },
  onShow: function () {
    // this.getnowP()//重新定位后获取新的存储位置
    console.log('页面展示', this.data.addr)
  },
  // 获取页面信息
  getAddr() {
    console.log('地址列表页传过来的地址id', this.data.FormData, this.data.FisKong)
    var id
    let FormData = this.data.FormData
    if (JSON.stringify(this.data.FormData) != "{}") {
      id = FormData.nowAddrID
    } else {
      id = this.data.nowAddrID
    }
    app.$apis('/address/detail/' + id, 'GET', {}).then(
      res => {
        // if(res.data.msg=='ok'){
        let addrData = res.data.data
        let FormData = this.data.FormData
        let { id, real_name, phone, detail, is_default } = addrData
        console.log('页面信息', addrData, FormData, this.data.FisKong)
        // if (JSON.stringify(this.data.FormData)!="{}") {
        // FormData.nowAddrID = id
        // FormData.real_name = real_name
        // FormData.phone = phone
        // FormData.detail = detail
        // FormData.is_default = is_default
        console.log(1111111, FormData)
        // }
        is_default = is_default == 0 ? false : true;
        this.setData({
          addr: addrData,
          // address: !FormData.province ? addrData.province + addrData.city + addrData.district + addrData.location : this.data.mapaddressStr,
          mapaddressStr: !FormData.province ? addrData.province + addrData.city + addrData.district + addrData.location : this.data.mapaddressStr,          
          // FormData: FormData,
          FormData: addrData,
          //将数据处理好可直接展示
          is_default: is_default,
          FisKong: false
        })
        console.log('fromdata页面信息',this.data.FormData,FormData)
        // console.log('当前地址详情获取成功', res.data.data, this.data.addr, this.data.address)
        // }
      }
    ), err => { console.log(err) }
  },
  // 获取各个输入框的值
  saveName(e) {
    // this.data.FormData.real_name=e.detail.value,
    let FormData = this.data.FormData
    FormData.real_name = e.detail.value
    this.setData({
      FormData: FormData,
      // handLose: true 
    })
    console.log(this.data.FormData.real_name)
  },
  savePhone(e) {
    let FormData = this.data.FormData
    FormData.phone = e.detail.value
    this.setData({
      FormData: FormData,
      // handLose: true 
    })
  },
  saveAddress(e) {
    let FormData = this.data.FormData
    FormData.address = e.detail.value
    this.setData({
      FormData: FormData,
      // handLose: true 
    })
  },
  saveDetail(e) {
    let FormData = this.data.FormData
    FormData.detail = e.detail.value
    this.setData({
      FormData: FormData,
      // handLose: true 
    })
  },
  // 新建地址设置默认地址
  setDefault(e) {
    let is_default = this.data.is_default
    let FormData = this.data.FormData
    is_default = e.detail.value
    FormData.is_default = Number(e.detail.value)
    this.setData({
      is_default: is_default,
      FormData: FormData
    })
    console.log('新页面是否默认', Number(e.detail.value), this.data.FormData.is_default)
  },
  // 已保存地址设为默认地址
  setDefaultAddr(e) {
    let is_default = this.data.is_default;
    let FormData = this.data.FormData
    // var id = FormData !== '' ? FormData.nowAddrID : this.data.nowAddrID
    var id = !FormData.nowAddrID ? FormData.id : FormData.nowAddrID

    is_default = e.detail.value
    this.setData({
      is_default: is_default
    })
    // if (is_default) {
    if (this.data.nowAddrID!=='') {
      app.$apis('/address/default/set', 'POST', {
        id: id
      }).then(res => {
        console.log(this.data.addrID)
        app.globalData.addrID = this.data.nowAddrID//更新全局默认地址id
        console.log('默认地址设置请求成功', res, this.data.is_default, app.globalData.addrID)
        // app.
      }), err => { console.log(err) }
    } else {
      console.log('取消了设置为默认', this.data.is_default)
    }
  },
  saveAddr() {
    let is_default = Number(this.data.is_default);
    // 将true或false转为数字1或0
    // is_default = is_default == 'false' ? 0 : 1
    console.log('保存地址时是否默认', Number(this.data.is_default), is_default)
    let FormData = this.data.FormData
    FormData.is_default = Number(this.data.is_default)
    console.log('保存', FormData, !this.data.FisKong)
    if (JSON.stringify(this.data.FormData) != "{}") {
      FormData.id = FormData.id ? FormData.id : FormData.nowAddrID ? FormData.nowAddrID : ''
      console.log(FormData)
    }
    app.$apis('/address/edit', 'POST', FormData).then(res => {
      console.log('保存地址发送成功', res.data, FormData)
      if (res.data.msg == 'ok') {
        wx.redirectTo ({
          url: '../myaddr/myaddr?urlType=' + 'fromEdit',
        })
      }
    }), err => { console.error(err) }
  },
  goSelectAddrmap() {
    // let FormData=this.data.
    let nowAddrID=JSON.stringify(this.data.FormData)+'|'+this.data.nowAddrID
    wx.navigateTo({
      // url: '../selectaddrmap/selectaddrmap?nowAddrID=' + this.data.nowAddrID
      url: '../selectaddrmap/selectaddrmap?nowAddrID=' + nowAddrID
    })
  },
  // 获取用户本地存储位置
  getnowP() {
    let FormData = this.data.FormData
    let stroageaddr = this.data.stroageaddr
    let city = wx.getStorageSync('city')
    FormData.id = ''
    FormData.province = wx.getStorageSync('province')
    FormData.city = wx.getStorageSync('city')
    FormData.district = wx.getStorageSync('dist')
    FormData.city_id = wx.getStorageSync('cityId')
    FormData.latitude = wx.getStorageSync('latitude')
    FormData.longitude = wx.getStorageSync('longitude')
    FormData.location = wx.getStorageSync('street')
    // var stroageaddr = province + city + district + location
    // 后台地址和定位城市一致
    for (var pname in FormData) {
      if (pname == 'city_id' || pname == 'nowAddrID' || pname == 'latitude' || pname == 'longitude') { continue }
      stroageaddr += FormData[pname]
    }
    this.setData({
      FormData: FormData,
      stroageaddr: stroageaddr
    })
    console.log('本地位置查询完毕', this.data.FormData)
  },
  // 获取用户当前位置
  getUserLocation() {
    // 使用微信提供的api获取经纬度
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        wx.setStorageSync('latitude', res.latitude)
        wx.setStorageSync('longitude', res.longitude)
      }
    })
    // 使用腾讯地图API,根据经纬度获取城市
    qqmapsdk.reverseGeocoder({
      success: (res) => {
        var a = res.result.address_component
        // 定位与后台相等再存入缓存
        if (a.district == wx.getStorageSync('dist')) {
          // 将数据保存到本地
          // wx.setStorageSync('province', a.province)//省
          // wx.setStorageSync('city', a.city)//市
          // wx.setStorageSync('dist', a.district)//区
          wx.setStorageSync('street', a.street)//街
          this.setData({
            // stroageaddr: a.province + a.city + a.district + a.street
            localCity: a.city
          })
          console.log('定位111111', this.data.localCity)
        }
      }
    })
  },
  onUnload:function(){
  
  }
})