// miniprogram/pages/index/search/search.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */

  data: {
    keyword: '',
    // hasRes:false,
    loading: false,
    hotProduct: '',
  },
  deltext() {
    this.setData({
      keyword: ''
    })
    console.log('清除')
  },
  // 跳转详情
  goDetail(e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../../prodetail/prodetail?id=' + e.currentTarget.dataset.id,
    })
  },
  saveKeyword(e) {
    this.setData({
      keyword: e.detail.value
    })
    console.log(this.data.keyword)
  },
// 键盘输入
bindKeyInput(e){
  if(e.detail.value==''){
    this.setData({
      loading:false,
      hotProduct:[]
    })
  }else{
    this.setData({
      keyword:e.detail.value,
    })
  }
  console.log(e.detail.value,this.data.keyword)
},
  // 搜索
  clickSearch() {
    let keyword = this.data.keyword
    console.log(this.data.keyword)
    if (keyword == '') {
      this.setData({
        loading: false,
        hotProduct: []
      })
    } else {
      let FormData = {
        keyword: keyword,
        uuid:wx.getStorageSync('uuid')
      }
      app.$apis('/products', 'POST', FormData).then(
        res => {
          if (res.data.msg == 'ok') {
            let hotProduct=res.data.data
            console.log('搜索结果成功', res.data)
            this.setData({
              hotProduct: hotProduct,
              loading: true,
              success:res=>{
                this.setData({
                  loading: true,
                  hotProduct:hotProduct
                })
              }
            })
          }
        }
      )
    }
  },
  // 添加到购物车
  addCar(e) {
    // const hotProduct=this.data.hotProduct;
    let id = e.currentTarget.dataset.id;
    console.log('111111111', id)
    app.$apis('/cart/add', 'POST', {
      cartNum: 1,
      productId: id
    }).then(
      res => {
        console.log('添加到购物车请求成功', res.data)
        if(res.data.msg=='ok'){
          wx.showToast({
            title: '添加成功',
          })
        }
        // this.setData({
        //   hotProduct:res.data.data
        // })
        // this.getIndexData()
      }
    )
  },
  //改变数量
  changeNum(e) {
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
    app.$apis('/cart/num', 'POST', {
      id: cart_id,
      number: cart_num
    }).then(
      res => {
        console.log('修改', res.data, cart_num, cart_id)
        this.setData({
          // hotProduct:res.data.data
          // cart_num:cart_num
        })
        // this.getIndexData()
      }
    ), err => { console.error(err) }
  },
  // 失去焦点
  blurCarNum(e) {
    const hotProduct = this.data.hotProduct;
    let index = e.currentTarget.dataset.index;
    let cart_num = e.detail.value;
    let cart_id = hotProduct[index].cart_id;
    console.log(cart_id)
    console.log('失去j焦点', hotProduct[index])
    app.$apis('/cart/num', 'POST', {
      id: cart_id,
      number: cart_num
    }).then(
      res => {
        console.log('添加数量失去焦点', res.data)
        // this.setData({
        //   hotProduct:res.data.data
        // })
        // this.getIndexData()
      }
    ), err => { console.error(err) }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})