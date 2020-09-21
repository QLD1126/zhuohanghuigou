// pages/myaddr/myaddr.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    addrid: '',//地址id
    isOk: false,
    isShow: false,
    isAddr: true,//是否有地址
    editIndex: 0,
    delBtnWidth: 120,//删除按钮宽度单位（rpx）
    isScroll: true,
    windowHeight: 0,
    addrList: [],
    isTouchArr: [],//是否拖动列表(删除用)
    urltype: '',//页面条黄钻类型参数,决定返回到哪个页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 使用选择器组件选择组件实例节点，返回匹配到的组件实例对象
    // this.meShowModal = this.selectComponent('#meShowModal')
    console.log('页面地址',app.globalData.urltype)
    this.setData({
      // urltype: options.urltype
      urltype:app.globalData.urltype
    })
    // console.log()
    // console.log(options,this.data.urltype)
  },
  onShow: function () {
    this.getAddrlist()
  },
  // 获取地址列表
  getAddrlist() {
    app.$apis('/address/list', 'GET', {}).then(
      res => {
        console.log('地址列表',res.data.data)
        this.setData({
          addrList: res.data.data
        })
      }
    ), err => { console.error(err) }
  },
  // 跳转,(订单待支付页,选中设置为收货地址/我的页面--编辑页面)
  confirmAddr(e) {
    console.log(11111111,this.data.urltype)
    let id = this.data.addrList[e.currentTarget.dataset.index].id
    this.setData({
      addrid:id
    })
    if(this.data.urltype=='fromMe'){
      wx.redirectTo({
        url: '../newaddr/newaddr?nowAddrID='+id,
      })
    }else{
    // else(this.data.urltype == 'formsubmitorder') {
      app.globalData.nowAddrID=id//当前选中地址id更新到全局
      console.log('地址列表,选中地址id--', id)
      wx.redirectTo({
        url: '../../order/submitorder/submitorder',
      })
    }
  },
  // 删除地址
  delAddr() {
    // 当前拖动项是数组中的最后一位
    let isTouchArr = this.data.isTouchArr
    let id = isTouchArr[isTouchArr.length - 1]
    console.log(id)
    app.$apis('/address/del', 'POST', {
      id: id
    }).then(
      res => {
        this.getAddrlist()
        this.setData({
          isShow: false
        })
        console.log('删除请求成功', res.data.msg, this.data.addrList)
      }
    ), err => { console.error(err) }
  },
  // 编辑
  editAddr(e) {
    // 将选中的地址的id值传给newaddr页面
    console.log('地址列表页,当前选中编辑地址id---', e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../newaddr/newaddr?nowAddrID=' + e.currentTarget.dataset.id,
    })
    //   app.globalData.addrID=e.currentTarget.dataset.id
  },
  //显示弹窗
  meShowModal() {
    this.setData({
      isShow: true
    })
  },
  // 弹窗结果
  getRes(a) {
    let res = a.currentTarget.dataset.res
    console.log(res)
    if (res == 'no') {
      this.setData({
        isShow: false,
        // 改变模态框状态
      })
      console.log('已取消')
    } else {
      this.delAddr()
      console.log('已确定', this.data.isOk)
    }
  },
  touchS(e) {
    // console.log('开始滑动',e.touches)
    // 判断是否只有一个触摸点
    if (e.touches.length == 1) {
      this.setData({
        // 记录触摸其实位置的x坐标
        startX: e.touches[0].clientX
      })
      // console.log('开始移动')
    }
  },
  // 触摸时触发,手指在屏幕上每移动一次,触发一次
  touchM(e) {
    // console.log('正在移动',e.touches.length==1)
    if (e.touches.length == 1) {
      // 记录触摸点位置的X坐标
      var moveX = e.touches[0].clientX;
      // 计算手指起始点的x坐标1余当前触摸点的x坐标的差值
      var disX = this.data.startX - moveX
      // delBtnWidth为右侧按钮区域的宽度
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = '';
      if (disX == 0 || disX < 0) {
        // 如果移动距离1小于等于10,文本层位置不变
        txtStyle == "left:-" + disX + 'rpx';
      } else if (disX > 0) {
        // 如果移动的距离大于0,文本层left值等于手指移动的距离
        txtStyle = "left:-" + disX + 'rpx';
        if (disX >= delBtnWidth) {
          // 如果控制手机移动1距离的最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + 'rpx'
        }
      }
      // 获取手指是触摸的哪一个item
      var index = e.currentTarget.dataset.index;
      var addrList = this.data.addrList;
      // 将拼接好的样式设置到当前item中
      addrList[index].txtStyle = txtStyle;
      // 更新列表的状态
      this.setData({
        addrList: addrList
      })
      // console.log('正在移动', this.data.addrList[index].txtStyle)
    }
  },
  // 触摸结束
  touchE(e) {
    // console.log('拖动结束',e)
    if (e.changedTouches.length == 1) {
      // 手指移动结束后触摸点位置的x坐标
      var endX = e.changedTouches[0].clientX;
      // 触摸开始于结束,手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      // 如果距离小于删除按钮的1/2.不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? 'left:-' + delBtnWidth + 'rpx' : 'left:0px'
      // 获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index
      var addrList = this.data.addrList;
      addrList[index].txtStyle = txtStyle;
      // 将触摸的这个item放入一拖动列表中,后面删除使用
      var isTouchArr = this.data.isTouchArr
      isTouchArr.push(addrList[index].id)
      // 更新列表状态
      this.setData({
        addrList: addrList,
        isTouchArr: isTouchArr
      })
    }
  },
  onUnload:function(){
    console.log('卸载',this.data.urltype)
    if(this.data.urltype=='fromMe'){
      wx.switchTab({
        url: '../../me/me',
      })
    }
    if(this.data.urltype=='formsubmitorder'){
      app.globalData.nowAddrID=this.data.addrid//当前选中地址id更新到全局
      wx.redirectTo({
        url: '../../order/submitorder/submitorder',
      })
    }
  }
})
