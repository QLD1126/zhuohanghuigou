// var requetNet = require('../../../libs/qqmap-wx-jssdk.js');
const app = getApp()
const QQMapWX = require('../../../libs/qqmap-wx-jssdk');
var qqmapsdk = new QQMapWX({
  key: 'XOLBZ-KEWKO-BGYWD-SREHQ-JR3YV-D2FR3'
  // key:'HIMBZ-S3J3X-5TD4K-76CR5-H4HJS-RGB2U'
})
console.log(111111, wx.getStorageSync('cityData') !== '')
Page({
  data: {
    nickName:'',
    phone:'',
    // 城市选择
    provinces: [],
    citys: [],
    countys: [],
    cityValue: [0, 0, 0],
    isCity: true,
    province: '',
    city: '',
    district: '',
    cityId: '',//用户区编号
    // 地图选点
    addressList: [],
    currentLat: '',
    currentLon: '',
    // markers:[],
    //搜索地图地址
    nosearch: true,
    tips: [],
    location: '',//经纬度
    istext: false,
    searchKey: '',
    FormData: {},
    // 列表
    detailAddress: '',//当前，定位省市区街
    isLocation: false,
    markers: [],
    meadd: false,
    // realy_input: false,//显示真的搜索框
    isList: false,//不显示地图
    addrList: [],//收货地址列表
    nowAddrID: '',//城市选择页传过来的
    sendAddress: '',
    address: '',//省市区选择之后的字符串,搜索用
  },
  onLoad: function (options) {
    this.getCurrentLocation()
    this.getCitylist()
    this.setData({
      phone:wx.getStorageSync('phone'),
      nickName:wx.getStorageSync('nickName'),
      currentLat:wx.getStorageSync('latitude'),
      currentLon:wx.getStorageSync('longitude'),
    })
    if (options.nowAddrID) {
      this.setData({
        nowAddrID: options.nowAddrID.split('|')[1],
        FormData:JSON.parse(options.nowAddrID.split('|')[0])
      })
    }
    console.log(this.data.FormData)
    // console.log(this.data.searchKey, wx.getStorageSync('city'))
  },
  onShow: function () {
    this.getnowP()
    this.getAddrlist()
  },
    // 获取地址列表
    getCitylist() {
      app.$apis('/city_list', 'GET', {}).then((res) => {
        this.setData({
          cityData: res.data.data
        })
        let addressda = res.data.data
        this.getStrcitydata(addressda)
        wx.setStorageSync('cityData', res.data.data)
      }), err => { console.log(err) }
    },
    getStrcitydata(addressda){
      var cityData = addressda;
      var provinces = [];
      var citys = [];
      var countys = [];
      var provinceName = cityData[0].label
      var cityName = cityData[0].children[0].label
      var countyName = cityData[0].children[0].children[0].label
      // 省
      for (let i = 0; i < cityData.length; i++) {
        provinces.push(cityData[i].label)
      }
      // 市
      for (let i = 0; i < cityData[0].children.length; i++) {
        citys.push(cityData[0].children[i].label)
      }
      // 区
      for (let i = 0; i < cityData[0].children[0].children.length; i++) {
        countys.push(cityData[0].children[0].children[i].label)
      }
      // var provinceName = cityData[0].label
      // var cityName = cityData[0].children[0].label
      // var countyName = cityData[0].children[0].children[0].label
      // var address = cityData[0].label + '' + cityData[0].children[0].label + '' + cityData[0].children[0].children[0].label
      this.setData({
        provinces: provinces,
        citys: citys,
        countys: countys,
        // address: wx.getStorageSync('city')
        address:cityName
      })
    },
  // 城市选择
  choiceCity() {
    // console.log(1111)
    this.setData({
      isCity: !this.data.isCity
    })
  },
  // 城市选择器
  cityChange: function (e) {
    var cityData = this.data.cityData
    var val = e.detail.value
    var t = this.data.cityValue
    var cityId = 0
    var address
    var provinces = [];
    var citys = [];
    var countys = [];
    // 省
    if (val[0] != t[0]) {
      citys = [];
      countys = [];
      for (let i = 0; i < cityData[val[0]].children.length; i++) {
        citys.push(cityData[val[0]].children[i].label)
      }
      for (let i = 0; i < cityData[val[0]].children[0].children.length; i++) {
        countys.push(cityData[val[0]].children[0].children[i].label)
      }

      var provinceName = cityData[val[0]].label;
      var cityName = cityData[val[0]].children[0].label;
      var countyName = cityData[val[0]].children[0].children[0].label
      var cityId = cityData[val[0]].children[0].children[0].value
      // address += cityData[val[0]].label + '' + cityData[val[0]].children[0].label + '' + cityData[val[0]].children[0].children[0].label
      this.setData({
        citys: citys,
        countys: countys,
        cityValue: [val[0], 0, 0],
        province: provinceName,
        city: cityName,
        district: countyName,
        cityId: cityId,
      })
      return
    }
    // 市
    if (val[1] != t[1]) {
      countys = []
      for (let i = 0; i < cityData[val[0]].children[val[1]].children.length; i++) {
        countys.push(cityData[val[0]].children[val[1]].children[i].label)
      }
      cityName = cityData[val[0]].children[val[1]].label
      countyName = cityData[val[0]].children[val[1]].children[0].label
      cityId = cityData[val[0]].children[val[1]].children[0].value
      address += cityData[val[0]].label + '' + cityData[val[0]].children[val[1]].label
      this.setData({
        countys: countys,
        cityValue: [val[0], val[1], 0],
        // address: address,
        city: cityName,
        district: countyName,
        cityId: cityId
      })
      return
    }
    // 区
    if (val[2] != t[2]) {
      countyName = cityData[val[0]].children[val[1]].children[val[2]].label
      cityId = cityData[val[0]].children[val[1]].children[val[2]].value
      // address += cityData[val[0]].label + '' + cityData[val[0]].children[val[1]].label + '' + cityData[val[0]].children[val[1]].children[val[2]].label
      this.setData({
        county: this.data.countys[val[2]],
        cityValue: val,
        cityId: cityId,
        district: countyName,
      })
      return
    }
  },
  // 确定
  ideChoice(e) {
    var $act = e.currentTarget.dataset.act;
    var $mold = e.currentTarget.dataset.mold;
    if ($act == 'confirm' && $mold == 'city') {
      let FormData=this.data.FormData
        FormData.city_id= this.data.cityId,
        FormData.province= this.data.province,
        FormData.city= this.data.city,
        FormData.district= this.data.district,
      this.setData({
        address: this.data.city,
        FormData: FormData
      })
      this.clickSearch()
    }
    // 公共取消隐藏
    this.setData({
      isCity: false
    })
  },
  // 地图
  getCurrentLocation: function () {
    var that = this;
    qqmapsdk.reverseGeocoder({
      success: (res) => {
        console.log('定位', res.result.location, that.data.tips.length)
        let locationData = res.result
        var a = locationData.address_component;//单独
        var latitude = locationData.location.lat//locationStr.split(',')[0]
        var longitude = locationData.location.lng;//locationStr.split(',')[1]
        //根据地址解析在地图上标记解析地址位置
        that.setData({ // 获取返回结果，放到markers及poi中，并在地图展示
          currentLat: latitude,
          currentLon: longitude,
          street: a.street,//传参
          city: a.city,
          address:a.city,
          detailAddress: a.street,
          markers: [{
            id: 0,
            title: res.street_number,
            latitude: that.data.currentLat,
            longitude: that.data.currentLon,
            label: {
              content: a.street,
              color: '#000',
              borderRadius: 10,
              bgColor: '#fff',
              padding: 3
            }
          }],
        });
        console.log('定位后',that.data.currentLat)
        if (that.data.tips.length !== 0) {
          that.configMap();
        }
      }
    })
  },
  // 选择搜索的地址后
  configMap: function () {
    var that = this;
    // 调用接口
    // console.log('---讲纬度', that.data.currentLat);
    let keywords = that.data.searchKey == '' ? that.data.address : that.data.address + that.data.searchKey
    qqmapsdk.search({
      keyword: keywords,
      location: {
        latitude: that.data.currentLat,
        longitude: that.data.currentLon
      },
      success: function (res) {
        console.log('qqmap_success', res);
        that.setData({
          // addressList: res.data
        })
      },
      fail: function (res) {
        console.log('qqmap_fail', res);
      },
    });
  },
  // 搜索框
  // 键盘输入
  bindKeyInput: function (e) {
    if (e.detail.value == '') {
      this.setData({
        nosearch: true
      })
    } else {
      this.setData({
        searchKey: e.detail.value,
        isList: true,
        nosearch: false
        // tips: []
      })
    }
    this.clickSearch()
  },
  // 输入盘/点击搜索
  clickSearch: function () {
    var that = this;
    let keywords = that.data.searchKey == '' ? that.data.address : that.data.address + that.data.searchKey
    console.log('搜索关键字', keywords)
    if (keywords == "") {
      that.setData({
        nosearch: true
      })
    } else {
      qqmapsdk.getSuggestion({
        keyword: keywords,
        success: function (res) {
          console.log('sucess', res);
          that.setData({
            tips: res.data,
            meadd: true,
            isList: true
          });
        },
        fail: function (res) {
          console.log('fail', res);
        },
      })
    }
  },
  //点击地址(列表)
  didSelectCell: function (e) {
    // var pages = getCurrentPages();
    // var prevPage = pages[pages.length - 3];
    console.log('didselectCell', e);
    var index = e.currentTarget.dataset.index;
    console.log('didselectCelldata', this.data.tips[index]);
    var locationData = this.data.tips[index];
    var latitude = locationData.location.lat//locationStr.split(',')[0]
    var longitude = locationData.location.lng;//locationStr.split(',')[1]
    let num = (locationData.district + locationData.city + locationData.province).length
    let detailAddress = locationData.address.substring(num) + locationData.title
    // console.log('1111111111111111', this.data.detailAddress)
    let FormData=this.data.FormData
    FormData.location=locationData.title
    // wx.setStorageSync('street', locationData.title)//街
    // wx.setStorageSync('address', locationData.address)//连在一起的
    this.setData({
      sendAddress: locationData.province + ',' + locationData.city + ',' + (locationData.district == undefined ? '' : locationData.district),
      detailAddress: detailAddress,
      address: locationData.province + '/' + locationData.city + (locationData.district == undefined ? '' : ('/' + locationData.district)),
      location: longitude + ',' + latitude,
      currentLat: latitude,
      currentLon: longitude,
      isList: false,
    })
  },
  // 隐藏地图
  goList() {
    this.setData({
      // realy_input: !this.data.realy_input//搜索框换成真的
      isList: !this.data.isList
    })
    console.log(this.data.isList)
  },
  // 使用当前这个
  useThisPositon() {
    console.log(111111,this.data.FormData)
    let FormData = this.data.FormData
    if (this.data.nowAddrID != '') { FormData.nowAddrID = this.data.nowAddrID }
    FormData.location = this.data.detailAddress
    FormData.latitude = this.data.currentLat
    FormData.longitude = this.data.currentLon
    this.setData({
      FormData: FormData
    })
    console.log('使用当前', FormData)
    wx.redirectTo({
      url: '../newaddr/newaddr?FormData=' + JSON.stringify(FormData),
    })
  },
  goLocation() {
    this.setData({
      isLocation: !this.data.isLocation
    })
    console.log(this.data.isLocation)
  },
  // 获取用户本地存储位置
  getnowP() {
    // let FormData = {
    //   city_id: wx.getStorageSync('cityId'),
    //   province: wx.getStorageSync('province'),
    //   city: wx.getStorageSync('city'),
    //   district: wx.getStorageSync('dist'),
    //   // nowAddrID: this.data.nowAddrID,
    //   location: wx.getStorageSync('street')
    // }
    let FormData=this.data.FormData
    FormData.city_id=wx.getStorageSync('cityId')
    FormData.province=wx.getStorageSync('province')
    FormData.city=wx.getStorageSync('city')
    FormData.district=wx.getStorageSync('dist')
    FormData.location=wx.getStorageSync('location')
    this.setData({
      FormData: FormData,
      city: wx.getStorageSync('city')
    })
    console.log('位置查询完毕', this.data.FormData)
  },
  // 获取收货地址列表
  getAddrlist() {
    app.$apis('/address/list', 'GET', {}).then(
      res => {
        console.log('获取收货地址成功', res.data.data)
        this.setData({
          addrList: res.data.data
        })
      }
    )
  },
  // 跳转,(订单待支付页,选中设置为收货地址/我的页面--编辑页面)
  confirmAddr(e) {
    let id = e.currentTarget.dataset.id
    console.log('地图列表选中的地址id', id)
    if (this.data.urltype == 'formsubmitorder') {
      app.globalData.nowAddrID = id//当前选中地址id更新到全局
      console.log('地址列表,选中地址id--', id)
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.redirectTo({
        url: '../newaddr/newaddr?nowAddrID=' + id,
      })
    }
  },
  getMap(e) {
    var latitude = e.detail.latitude
    var longitude = e.detail.longitude
    console.log('点击', e.detail)
    // 地址逆解析
    qqmapsdk.reverseGeocoder({
      //位置坐标，默认获取当前位置，非必须参数
      //Object格式
      location: {
        latitude: latitude,
        longitude: longitude
      },
      get_poi: 1, //是否返回周边POI列表：1.返回；0不返回(默认),非必须参数
      success: (res) => {//成功后的回调
        console.log('逆解析成功', res.result);
        var locationData = res.result;//不点poi的结果
        // var result = res//周边列表
        var mks = [];
        //  *  当get_poi为1时，检索当前位置或者location周边poi数据并在地图显示，可根据需求是否使用
        for (var i = 0; i < locationData.pois.length; i++) {
          mks.push({ // 获取返回结果，放到mks数组中
            title: locationData.pois[i].title,
            id: locationData.pois[i].id,
            latitude: locationData.pois[i].location.lat,
            longitude: locationData.pois[i].location.lng,
            // iconPath: './resources/placeholder.png', //图标路径
            width: 20,
            height: 20,
            label: {
              content: locationData.pois[i].title,
              color: '#000',
              borderRadius: 10,
              bgColor: '#fff',
              padding: 3
            }
          })
        }
        var locationData = res.result
        var latitude = locationData.location.lat;
        var longitude = locationData.location.lng;
        // let num = (location.ad_info.province + result.pois[i].ad_info.city + result.pois[i].ad_info.district).length
        let detailAddress = locationData.formatted_addresses.recommend
        this.setData({ //设置markers属性和地图位置poi，将结果在地图展示
          markers: mks,
          poi: {
            latitude: latitude,
            longitude: longitude
          },
          detailAddress: detailAddress,
          // address: result.pois[i].ad_info.province + '/' + result.pois[i].ad_info.city + (result.pois[i].ad_info.district == undefined ? '' : result.pois[i].ad_info.district),
          address: locationData.address_component.province + locationData.address_component.city + locationData.address_component.district,
          currentLon: longitude,
          currentLat: latitude,
        });
      },
      fail: (error) => {
        console.error(error);
      },
    })
  },

})