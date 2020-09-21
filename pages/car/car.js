// pages/car/car.js
const app = getApp()
Page({
  data: {
    isLogin: wx.getStorageSync('isLogin'),
    modeltitle: 'delpro',
    dodel: false,//结算/删除状态
    carList: [],//购物车列表
    hasList: false,//列表是否有数据
    totalPrice: 0,//总价
    totalDep: 0,//包装物总价
    lowestPrice: Number(wx.getStorageSync('userInfo').min_pay_price),//最低起购价格
    selected: false,//单个选中状态 
    selectAllStatus: false,//全选状态
    valid: [],//有效商品
    invalid: [],//失效商品
    // is_pay:0//购买权限
    // is_pay: wx.getStorageSync('is_pay')
  },
  onLoad: function (options) {
    this.getData()
    this.setData({
      isLogin: wx.getStorageSync('isLogin'),
      lowestPrice: Number(wx.getStorageSync('userInfo').min_pay_price),//最低起购价格
      totalDep: this.data.totalDep.toFixed(2),
      totalPrice: this.data.totalPrice.toFixed(2)
    })
  },
  onShow: function () {

    console.log(this.data.lowestPrice)
    this.getCarList()
    // this.getTotalPrice()
  },
  //获取购物车数据
  getData() {
    let valid = this.data.valid;
    for (var item of valid) {
      // console.log(item)
      // 原始类型要接住
      item.price = parseInt(item.productInfo.price).toFixed(2)
    }
    this.setData({
      valid: valid
    })
  },
  // 获取城市数据
  getCarList() {
    app.$apis('/cart/list', 'GET', {}).then(
      res => {
        this.setData({
          valid: res.data.data.valid,
          invalid: res.data.data.invalid
        })
        console.log('购物车数据', res.data.data)
      }
    ), err => { console.error(err) }
  },
  // 切换删除/结算状态
  doDel() {
    let dodel = this.data.dodel
    // this.deleteList()
    this.setData({
      dodel: !this.data.dodel
    })
    console.log('切换状态', dodel)
  },
  // 计算总价和押金
  getTotalPrice() {
    let valid = this.data.valid;//购物车列表
    var total = 0;
    var dep = 0;
    for (var i = 0; i < valid.length; i++) {
      if (valid[i].selected) {//判断选中才会计算价格
        total += valid[i].cart_num * Number(valid[i].productInfo.price);
        dep += valid[i].cart_num * Number(valid[i].productInfo.dep_price);
      }
    }
    this.setData({//复制渲染到页面
      valid: valid,
      totalDep: dep.toFixed(2),
      totalPrice: (total + dep).toFixed(2),
    })
    console.log('计算了一次总价', this.data.totalDep)
  },
  // 
  //单选事件
  selectList(e) {
    const index = e.currentTarget.dataset.index;//获取data-传进来的index
    let valid = this.data.valid;
    let selected = this.data.selected;
    let selectAllStatus = this.data.selectAllStatus;
    let selectedArr = [];//状态的值数组
    // selected=!selected
    console.log('111', valid[index].selected, this.data.selected)
    valid[index].selected = !selected      //添加当前商品的选中状态
    console.log('当前选中状态', valid[index].selected, this.data.selected)
    // 如果每个单选都是true,则改变全选的状态为true
    for (var item of valid) {
      selectedArr.push(item.selected)
    }
    //单选所有结果
    var res = selectedArr.every((element) => { return element == true })
    this.setData({
      selected: !selected,
      selectAllStatus: res,
      valid: valid
    });
    this.getTotalPrice()//重新获取总价
    console.log('单个选择了', valid[index].cart_num)
  },
  //全选事件
  selectAll() {
    let selectAllStatus = this.data.selectAllStatus;//是否全选状态
    selectAllStatus = !selectAllStatus
    let valid = this.data.valid;
    for (var item of valid) {
      item.selected = selectAllStatus//改变所有商品状态
    }
    this.setData({
      selectAllStatus: selectAllStatus,
      valid: valid
    })
    console.log('全选', selectAllStatus)
    this.getTotalPrice()//重新获取总价
  },
  //增减数量
  //点击+号，cart_num加1，点击-号，如果cart_num > 1，则减1
  //增减按钮
  changeNum(e) {
    if(this.data.isLogin){
    let sym = e.currentTarget.dataset.sym;//当前按钮状态
    let index = e.currentTarget.dataset.index;//当前下标
    const valid = this.data.valid;
    let cart_num = valid[index].cart_num;//当前商品数量
    let cart_id = valid[index].id;//购物车id
    if (sym == 'min') {
      cart_num -= 1
      console.log('----')
    } else {
      cart_num += 1
    }
    if (cart_num <= 0) {
      return
    }
    valid[index].cart_num = cart_num
    this.setData({
      valid: valid
    })
    this.getTotalPrice()
    console.log('增减数量')
    app.$apis('/cart/num', 'POST', {
      id: cart_id,
      number: cart_num
    }).then(
      res => {
        console.log('修改', res.data.msg)
      }
    ), err => { console.error(err) }
    }else{
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 失去焦点
  bindblur(e) {
    if(this.data.isLogin){
    const index = e.currentTarget.dataset.index;
    let valid = this.data.valid;
    let cart_id = valid[index].id;//购物车id
    valid[index].cart_num = parseInt(e.detail.value)
    this.setData({
      valid: valid
    })
    this.getTotalPrice()
    app.$apis('/cart/num', 'POST', {
      id: cart_id,
      number: parseInt(e.detail.value)
    }).then(
      res => {
        console.log('修改', res.data.msg)
      }
    ), err => { console.error(err) }
    console.log('失去焦点事件')
    }else{
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 删除商品(单个)
  deleteList(e) {
    if(this.data.isLogin){
    const index = e.currentTarget.dataset.index;
    let valid = this.data.valid;
    valid.splice(index, 1)//从购物车删除这个商品
    this.setData({
      valid: valid
    })
    this.getTotalPrice()
  }else{
    wx.switchTab({
      url: '../me/me',
    })
  }
  },
  // 批量删除
  deleteSome() {
    if(this.data.isLogin){
    var valid = this.data.valid;
    var ids = [];
    for (var item of valid) {
      if (item.selected) {
        ids.push(item.id)
      }
    }
    app.$apis('/cart/del', 'POST', {
      ids: ids
    }).then(
      res => {
        this.getCarList()
        console.log('删除成功', res.data.msg)
      }
    ), err => { console.error(err) }
    console.log('删除了', valid.length)
    }else{
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 跳转首页
  goIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  // 提交确认订单页
  confirmOrder() {
    if (this.data.isLogin) {
      const valid = this.data.valid;
      var cartId = [];
      for (var item of valid) {
        if (item.selected) {
          cartId.push(item.id)
        }
      }
      app.$apis('/order/confirm', 'POST', {
        cartId: cartId
      }).then(res => {
        console.log('创建订单请求成功', res.data.data)
        let orderconfirm = JSON.stringify(res.data.data)
        app.globalData.orderconfirm = orderconfirm
        console.log(1111111111, app.globalData.orderconfirm)
        wx.navigateTo({
          url: '../order/submitorder/submitorder?orderconfirm=' + orderconfirm
          // +'&total_cart_num='+total_cart_num,
        })
      }), err => { console.error(err) }
    }else{
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 弹窗
  meShowModal() {
    this.setData({
      isShow: true
    })
  },
  // aa(){console.log(111)},
  // 隐藏静态对话框
  meHideModal() {
    this.setData({
      isShow: false
    })
    console.log('组件已隐藏')
  },
  // 取消点击事件
  meCancel() {
    this.meHideModal()
    console.log('取消了')
  },
  // 点击确定
  meConfirm() {
    this.deleteSome()
    this.meHideModal()
    console.log('确定了,已删除')
  },
  onPullDownRefresh: function () {
    console.log('上上上上上')
    // wx.showNavigationBarLoading()
    wx.showLoading({
      title: '加载中...',
      icon: 'loading',
    })
    setTimeout(() => {
      this.getCarList()
      this.setData({
        lowestPrice: Number(wx.getStorageSync('userInfo').min_pay_price),//最低起购价格
      })
      console.log(this.data.lowestPrice)
      // 数据请求成功,停止下拉刷新
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }, 1000)
  },
  onHide: function () {
    this.setData({
      // selected: false,//单个选中状态 
      // selectAllStatus: this.data.selected,//全选状态
      selectAllStatus: false
    })
  },
  onunload: function () {
    this.setData({
      // selected:false,
      // selectAllStatus:false
    })
  }
})