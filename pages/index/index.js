// 获取应用实例
const QQMapWX = require('../../libs/qqmap-wx-jssdk');
var qqmapsdk = new QQMapWX({
  key: 'XOLBZ-KEWKO-BGYWD-SREHQ-JR3YV-D2FR3'
})
const app = getApp()
Page({
  data: {
    isLogin: false,
    street:'',
    cache_key: '',
    token: '',
    code: '',
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // 城市选择
    cityData: [],
    provinces: '',
    citys: '',
    countys: '',
    cityValue: [0, 0, 0],
    isCity: true,
    province: wx.getStorageSync('province'),
    city: wx.getStorageSync('city'),//当前定位城市(缓存城市)
    handCity: '',//用户手选城市
    district: wx.getStorageSync('dist'),
    cityId: wx.getStorageSync('cityId'),//用户区编号
    logo: '',//logo地址
    userinfo: '',//用户登录后的信息
    num: 1,
    datalist: [],
    banner: [],//背景图
    category: [],//10分类
    hotProduct: [],//商品详情
  },
  onLoad: function (options) {
    // console.log(111111,typeof(wx.getStorageSync('street')),wx.getStorageSync('street').length)
    this.getCitylist()
    // this.getUserLocation()
    // this.getuserinfo()
  },
  onShow: function () {
    this.setData({
      street: wx.getStorageSync('street').length==0 ? '' : '>' + wx.getStorageSync('street'),
      isCity: wx.getStorageSync('cityId') == '' ? true : false,
      // is_pay: wx.getStorageSync('is_pay'),
      city: wx.getStorageSync('city'),
      isLogin: wx.getStorageSync('isLogin'),
    })
    console.log(1111111111,this.data.isLogin,22222,wx.getStorageSync('isLogin'))
    if (wx.getStorageSync('cityId')) {
      this.getIndexData()
      this.getCategory()
      this.getPro()
    }
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
  getStrcitydata(addressda) {
    var cityData = addressda
    var provinces = [];
    var citys = [];
    var countys = [];
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
    var provinceName = cityData[0].label
    var cityName = cityData[0].children[0].label
    var countyName = cityData[0].children[0].children[0].label
    var address = cityData[0].name + '' + cityData[0].children[0].label + '' + cityData[0].children[0].children[0].label
    this.setData({
      provinces: provinces,
      citys: citys,
      countys: countys,
      cityData: cityData
    })
  },
  // 城市选择
  choiceCity() {
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
      address += cityData[val[0]].label + '' + cityData[val[0]].children[0].label + '' + cityData[val[0]].children[0].children[0].label
      this.setData({
        citys: citys,
        countys: countys,
        cityValue: [val[0], 0, 0],
        province: provinceName,
        city: cityName,
        handCity: cityName,
        district: countyName,
        cityId: cityId
        // address: address
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
      address += cityData[val[0]].label + '' + cityData[val[0]].children[val[1]].label + '' + cityData[val[0]].children[val[1]].children[0].label
      this.setData({
        countys: countys,
        cityValue: [val[0], val[1], 0],
        // address: address,
        city: cityName,
        handCity: cityName,
        district: countyName,
        cityId: cityId
      })
      return
    }
    // 区
    if (val[2] != t[2]) {
      countyName = cityData[val[0]].children[val[1]].children[val[2]].label
      cityId = cityData[val[0]].children[val[1]].children[val[2]].value
      address += cityData[val[0]].label + '' + cityData[val[0]].children[val[1]].label + '' + cityData[val[0]].children[val[1]].children[val[2]].label
      this.setData({
        county: this.data.countys[val[2]],
        cityValue: val,
        cityId: cityId,
        district: countyName,
        // address: address
      })
      return
    }
  },
  // 确定
  ideChoice(e) {
    var $act = e.currentTarget.dataset.act;
    var $mold = e.currentTarget.dataset.mold;
    if ($act == 'confirm' && $mold == 'city') {
      // let FormData=this.data.FormData
      let FormData = {
        city_id: this.data.cityId,
        province: this.data.province,
        city: this.data.handCity,
        district: this.data.district,
        nowAddrID: this.data.nowAddrID
      }
      // console.log(1111111111, FormData)
      app.$apis('/setting/address', 'POST', {
        cityId: this.data.cityId,
        p: this.data.province,
        c: this.data.handCity,
        d: this.data.district,
        uuid: wx.getStorageSync('uuid')
      }).then(res => {
        if (res.data.msg == '设置成功') {
          console.log('城市更新成功', res.data)
          // 将更新后的地址保存到本地缓存
          wx.setStorageSync('province', this.data.province)
          wx.setStorageSync('city', this.data.handCity)
          wx.setStorageSync('dist', this.data.district)
          wx.setStorageSync('cityId', this.data.cityId)
          wx.setStorageSync('uuid', res.data.data.uuid)
          wx.removeStorageSync('street')
          this.setData({
            FormData: FormData,
            isCity: false,
            city: this.data.handCity,
          })
          // 确定城市之后再加载数据
          this.getUserLocation()
          this.getIndexData()
          this.getCategory()
          this.getPro()
        }
      })
      this.setData({
        // cityText: provinceName + '' + cityName + '' + countyName,
        // handCity:this.data.city
      })
    }
    // 公共取消隐藏
    else {
      wx.showToast({
        title: '请选择你所在的城市',
        icon: 'none'
      })
    }
  },
  // 获取用户当前位置
  getUserLocation() {
    var that = this
    // 使用腾讯地图API,根据经纬度获取城市
    qqmapsdk.reverseGeocoder({
      success: function (res) {
        console.log('当前位置', res)
        let locationData = res.result
        var a = locationData.address_component;//单独
        var b = locationData.address
        var latitude = locationData.location.lat//locationStr.split(',')[0]
        var longitude = locationData.location.lng;//locationStr.split(',')[1]
        // var b = locationData.address;//连在一起的
        // 首页定位时缓存
        console.log(a.city, wx.getStorageSync('city'))
        if (wx.getStorageSync('dist') == a.district) {
          console.log(11111111111)
          wx.setStorageSync('street', a.street)//街
          wx.setStorageSync('address', b)//连在一起的
          wx.setStorageSync('latitude', latitude)
          wx.setStorageSync('longitude', longitude)
          that.setData({
            street: '>' + a.street,//传参
            // nowcity: a.city,
            detailAddress: a.street,
          });
        } else {
          that.setData({
            street: '',
          })
        }
      }
    })
  },
  //获取主页信息(背景图和热卖)
  getIndexData() {
    app.$apis('/index', 'GET', { uuid: wx.getStorageSync('uuid') }).then((res) => {
      console.log('主页信息', res.data.data)
      let indexdata = res.data.data
      this.setData({
        banner: indexdata.banner,
        hotProduct: indexdata.hotProduct
      })
      console.log(res.data.data)
    }), err => {
      console.log(err)
    }
  },
  // 获取十个分类
  getCategory() {
    app.$apis('/category', 'GET', {})
      .then(res => {
        this.setData({
          category: res.data.data
        })
        console.log('分类', res.data)
      })
  },
  // 跳转到分类详情页
  goCategory(e) {
    let index = e.currentTarget.dataset.index
    const category = this.data.category;
    let cate_id = category[index].id;
    app.globalData.cate_id_index = index;
    app.globalData.cate_id = cate_id;
    console.log('商品分类全局id', app.globalData.cate_id, cate_id)
    console.log(category[index].id)
    wx.switchTab({
      url: '../pclass/pclass',
    })
  },
  // 获取商品信息(未渲染)
  getPro() {
    app.$apis('/products', 'POST', {})
      .then((res) => {
        console.log('商品信息', res.data.data)
      }), err => { console.error(err) }
  },
  // 跳转
  goDetail(e) {
    let id = e.currentTarget.dataset.index
    let url = e.currentTarget.dataset.url
    id = url ? Number(url.split('?')[1].substr(3)) : id
    wx.navigateTo({
      url: '../prodetail/prodetail?id=' + id
      // url:'../prodetail'
    })
    console.log(id)
  },
  // 添加到购物车
  addCar(e) {
    console.log(11111111,this.data.isLogin)
    if (this.data.isLogin) {
      const hotProduct = this.data.hotProduct;
      let index = e.currentTarget.dataset.index;
      let id = hotProduct[index].id;
      let fromData = {
        cartNum: 1,
        productId: id
      }
      app.$apis('/cart/add', 'POST', fromData).then(
        res => {
          if (res.data.status == 200) {
            wx.showToast({
              title: '添加成功',
              icon: 'success',
              duration: 500,
              success: res => {
                this.getIndexData()
              }
            })
          }
          // this.getIndexData()
          console.log('添加到购物车请求成功', res.data, hotProduct[index].cart_num)
        }
      )
    } else {
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  //改变数量
  changeNum(e) {
    if (this.data.isLogin) {
      const hotProduct = this.data.hotProduct;
      let index = e.currentTarget.dataset.index;
      let sym = e.currentTarget.dataset.sym;
      let cart_id = hotProduct[index].cart_id;
      let cart_num = hotProduct[index].cart_num;
      console.log(hotProduct[index])
      if (sym == 'min') {
        cart_num -= 1
      } else {
        cart_num += 1
      }
      this.setData({ ids: cart_num })
      if (cart_num >= 1) {
        app.$apis('/cart/num', 'POST', {
          id: cart_id,
          number: cart_num
        }).then(
          res => {
            console.log('修改', res.data, cart_num, cart_id)
            // this.getIndexData()
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 500,
              success: res => {
                this.getIndexData()
              }
            })
          }
        ), err => { console.error(err) }
      } else {
        this.setData({
          ids: cart_id
        })
        this.deledePro()
      }
    } else {
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 失去焦点
  blurCarNum(e) {
    if (this.data.isLogin) {
      const hotProduct = this.data.hotProduct;
      let index = e.currentTarget.dataset.index;
      let cart_num = parseInt(e.detail.value);
      let cart_id = hotProduct[index].cart_id;
      console.log('失去j焦点', hotProduct[index])
      this.setData({
        ids: cart_num
      })
      if (cart_num >= 1) {
        app.$apis('/cart/num', 'POST', {
          id: cart_id,
          number: cart_num
        }).then(
          res => {
            console.log('添加数量失去焦点', res.data)
            // this.getIndexData()
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 500,
              success: res => {
                this.getIndexData()
              }
            })
          }
        ), err => { console.error(err) }
      } else {
        this.setData({
          ids: cart_id
        })
        this.deledePro()
      }
    } else {
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 从购物车删除
  deledePro() {
    if (this.data.isLogin) {
      let ids = this.data.ids
      app.$apis('/cart/del', 'POST', { ids: ids }).then(
        res => {
          console.log('删除成功', res.data)
          // this.getIndexData()
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 500,
            success: res => {
              this.getIndexData()
            }
          })
        }
      )
    } else {
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 调用组件内的方法
  // showComponent(){
  //   let noBuy=this.noBuy
  //   noBuy.call()
  // },
  //搜索
  toSearch() {
    wx.navigateTo({
      url: './search/search',
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中...',
      icon: 'loading',
      duration: 1000,
    })
    setTimeout(() => {
      this.getUserLocation()
      this.getIndexData()
      this.getCategory()
      this.getPro()
      this.setData({
      isLogin: wx.getStorageSync('isLogin'),
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }, 1000)
  }
  ,
  onReachBottom: function () {
    wx.showToast({
      title: '已加载全部',
      icon: 'none'
    })
  }
})