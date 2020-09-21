// pages/pclass/pclass.js
const app = getApp()
Page({
  heightArr: [],//[右侧分类的高度累加数组][时令水果,时令水果+休闲零食,...]
  distance: 0,//记录scroll-view滚动过程中距离顶部的高度
  /**
   * 页面的初始数据
   */
  data: {
    isLogin: wx.getStorageSync('isLogin'),
    ids: '',//要删除的商品id
    scrollTops: 0,
    currentLeft: 0,//左侧选中下标
    selectId: 'item3',//当前显示的元素id
    scrollTop: 0,//到顶部的距离
    serviceTypes: [],//项目数据列表
    staffList: [],//项目详情列表
    cate_id: 7,//品类默认为7
    cate_id_index: 0,//品类下标
    // coupons: [],
    // windowHeight: '0px',
    categorylist: [],
    prolist: [],
    page: 1,
    limit: 8,
    hasMore: true,//还有等多的数据
    // is_pay: wx.getStorageSync('is_pay'),
    reachbottom: 0,//下拉次数
    pullstatus: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(1111111, this.data.isLogin)
    // this.requrst()
    this.selectHeight()
    this.getCategory()
  },
  onShow: function () {
    console.log(app.globalData)
    let cate_id_index = app.globalData.cate_id_index;
    let cate_id = app.globalData.cate_id;
    let currentLeft = this.data.currentLeft;
    currentLeft = cate_id_index;//品类下标
    this.setData({
      isLogin: wx.getStorageSync('isLogin'),
      // isLogin: isLogin,
      cate_id_index: app.globalData.cate_id_index,
      cate_id: cate_id,
      currentLeft: currentLeft
    })
    this.refreshProlist()
  },
  requrst() {
    this.selectHeight();
  },
  // 获取十个分类
  getCategory() {
    app.$apis('/category', 'GET', {})
      .then(res => {
        this.setData({
          categorylist: res.data.data
        })
        console.log('分类', res.data.data)
      })
  },
  // 获取商品详情
  getProlist() {
    console.log(this.data.page)
    let FormData = {
      page: this.data.page,
      limit: this.data.limit,
      cate_id: this.data.cate_id,
      uuid: wx.getStorageSync('uuid')
    }
    console.log('参数', FormData)
    app.$apis('/products', 'POST', FormData)
      .then(res => {
        console.log('商品列表', res.data.data)
        let prolist = this.data.prolist;
        let prores = res.data.data;
        let loadend = prores.length < this.data.limit
        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 1000,
          success: res => {
            if (prores.length == 0 || loadend) {
              this.setData({
                hasMore: false
              })
            }
            // else {
            console.log('还有数据', this.data.hasMore)
            // var newprolist=prolist.concat(res.data.data)
            prolist.push(...prores)
            console.log(222222, prolist)
            this.setData({
              prolist: prolist
            })
            // }
          }
        })

      }), err => { console.log(err) }
  },
  // 获取商品详情2
  refreshProlist() {
    let FormData = {
      page: 1,
      // limit: this.data.limit + this.data.limit * this.data.reachbottom,
      limit: this.data.limit,
      cate_id: this.data.cate_id,
      uuid: wx.getStorageSync('uuid')
    }
    console.log('刷新参数', FormData)
    app.$apis('/products', 'POST', FormData).then(
      res => {
        console.log('刷新后的商品信息', res.data.data)
        let prores = res.data.data
        let loadend = prores.length < this.data.limit
        console.log(11111, prores.length)
        if (prores.length == 0 || loadend) {
          this.setData({
            hasMore: false,
          })
        }
        else {
          this.setData({
            hasMore: true
          })
        }
        this.setData({
          prolist: prores
        })
      }
    )
  },
  // 选择项目左侧点击事件currentLeft:控制左侧选中样式 selectId:设置右侧应显示在顶部的id
  proItemTap(e) {
    let index = e.currentTarget.dataset.index
    let cate_id = this.data.categorylist[index].id
    this.setData({
      cate_id: cate_id,
      // page: 1,
      currentLeft: index,
      selectId: "item" + index,
      // scrollTops: index * 130
    })
    this.refreshProlist()
    // this.getProlist()
    // console.log('右侧距离顶部', this.data.scrollTops)
  },
  // 计算右侧每一个分类的高度,在数据请求成功后即可
  selectHeight() {
    let that = this;
    this.heightArr = [];
    let h = 0;
    const query = wx.createSelectorQuery();
    query.selectAll('.class-item').boundingClientRect()
    query.exec(function (res) {
      res[0].forEach((item) => {
        h += item.height;
        that.heightArr.push(h)
      })
      console.log('高度', that.heightArr, h)
    })
  },
  // 监听scroll-view滚动事件
  scrollEvent(event) {
    if (this.heightArr.length == 0) {
      return
    }
    let scrollTop = event.detail.scrollTop;
    let current = this.data.currentLeft;
    if (scrollTop >= this.data.distance) {
      // 页面向上滑动
      //如果右侧当前可视区最底部到最顶部的距离超过当前列表项距离顶的距离的高度(且没有下标越界),则更新左侧选中项
      if (current + 1 < this.heightArr.length && scrollTop >= this.heightArr[current]) {
        this.setData({
          currentLeft: current + 1
        })
        console.log('页面上滑', current)
      }
    } else {
      //页面向下滚动
      // 如果右侧当前可视区域最顶部到顶部的距离小于当前列表选中的顶距顶部的高度,则更新在左侧选项中
      //如果右侧当前可视区域最顶部到顶部的距离 小于 当前列表选中的项距顶部的高度，则更新左侧选中项
      if (current - 1 >= 0 && scrollTop < this.heightArr[current - 1]) {
        this.setData({
          currentLeft: current - 1
        })
      }
    }
    // 更新到顶部的距离
    this.data.distance = scrollTop
  },
  //滚动到指定名称的某一项（通过列表的商品name来判断，也可以用id或者其他的，只要是列表项的唯一标志）
  scrollTo(name) {
    let that = this;
    const query = wx.createSelectorQuery()
    query.select(".right-info").boundingClientRect()
    //计算每一个item的高度（右侧分类的小标题高度是在css里写死的50px）
    query.exec(function (res) {
      that.moveHeight(res[0].height, name);
      console.length(res[0].height, name)
    })
  },
  moveHeight(height, name) {
    let list = this.data.serviceTypes;
    let top = 50; //右侧每一分类的标题名称的高度为50px，top记录每一个标题到顶部的距离
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list[i].services.length; j++) {
        //如果当前的item是要滚动到顶部的，
        if (list[i].services[j].name == name) {
          this.setData({
            scrollTop: height * j + top
          })
          break;
        }
      }
      //右侧每划过一个分类，就把此分类的高度和标题的高度累加到top上
      top = top + list[i].services.length * height + 50;
    }
  },
  // 跳转
  goDetail(e) {
    wx.navigateTo({
      url: '../prodetail/prodetail?id=' + e.currentTarget.dataset.id,
    })
  },
  toList(e) {
    this.target.dataset.lid == this
  },
  // 添加到购物车
  addCar(e) {
    if (this.data.isLogin) {
      const prolist = this.data.prolist;
      let index = e.currentTarget.dataset.index;
      let id = prolist[index].id;
      let FormData = {
        cartNum: 1,
        productId: id
      }
      app.$apis('/cart/add', 'POST', FormData).then(
        res => {
          console.log(res)
          if (res.data.data.cartId) {
            wx.showToast({
              title: '添加成功',
              icon: 'success',
              success: res => {
                this.refreshProlist()
              }
            })
          }
        }
      ), err => { console.error(err) }
    } else {
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  //增减按钮
  changeNum(e) {
    if (this.data.isLogin) {
      let sym = e.currentTarget.dataset.sym;//当前按钮状态
      let index = e.currentTarget.dataset.index;//当前下标
      const prolist = this.data.prolist;
      let cart_num = prolist[index].cart_num;//当前商品数量
      let cart_id = prolist[index].cart_id;//购物车id
      if (sym == 'min') {
        cart_num -= 1
        console.log('----')
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
            console.log('修改', res.data.msg, cart_id, cart_num)
            // this.refreshProlist()
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              success: res => {
                this.refreshProlist()
              }
            })
          }
        ), err => { console.error(err) }
      } else {
        // if(cart_num==0){
        this.setData({
          ids: cart_id
        })
        this.deledePro()
        // }
      }
      console.log(111111, this.data.prolist[index].cart_num, cart_num)
    } else {
      wx.switchTab({
        url: '../me/me',
      })
    }
  },
  // 失去焦点
  bindblur(e) {
    if (this.data.isLogin) {
      const index = e.currentTarget.dataset.index;
      let prolist = this.data.prolist;
      let cart_num = prolist[index].cart_num;
      let cart_id = prolist[index].cart_id;
      let val = parseInt(e.detail.value);
      // 将失去焦点后的值赋给cart_num
      cart_num = val
      this.setData({ ids: cart_num })
      if (cart_num >= 1) {
        app.$apis('/cart/num', 'POST', {
          id: cart_id,
          number: cart_num
        }).then(
          res => {
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              success: res => {
                this.refreshProlist()
              }
            })
            console.log('修改', res.data.msg, cart_id, cart_num)
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
    // console.log('失去焦点事件')
  },
  // 从购物车删除
  deledePro() {
    if (this.data.isLogin) {
      let ids = this.data.ids
      console.log('要删除的id', ids)
      app.$apis('/cart/del', 'POST', { ids: ids }).then(
        res => {
          console.log('删除成功', res.data)
          // this.refreshProlist()
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            success: res => {
              this.refreshProlist()
            }
          })
        }
      )
    }
  },
  // 触底加载
  onReachBottom: function () {
    console.log(1111111111, '触底', this.data.hasMore)
    //没有下拉状态才进行加载数据
    // !this.data.pullstatus && this.getProlist()
    if (this.data.hasMore) {
      console.log(this.data.hasMore)
      this.setData({
        page: this.data.page + 1,
        reachbottom: this.data.reachbottom + 1
      })
      this.getProlist()
      console.log('触底了', this.data.cate_id, this.data.page, this.data.limit, '总limit', this.data.reachbottom)
    } else {
      wx.showToast({
        title: '已加载全部',
        icon: 'none'
      })
    }
  },
})