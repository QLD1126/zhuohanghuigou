// miniprogram/pages/deposit/Refund/refund.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempFilePaths: '',
    imagePath: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow: function () {
    this.getData()
  },
  getData() {
    app.$apis('/user', 'GET', {}).then(
      res => {
        console.log('获取收款码连接成功',res.data)
        wx.setStorageSync('userInfo', res.data.data.data)
        this.setData({
          imagePath: res.data.data.receiving_qr_img
        })
      }
    )
  },
  // 上传图片
  chooseUImage() {
    wx.chooseImage({
      count: 1,//图片数量
      sizeType: ['compressed'],//原图/压缩图
      successType: ['album', 'camera'],//可以指定来源是相册/相机
      success:(res)=>{
        console.log(res)
        // 返回选定照片的本地文件路径列表
        var tempFilePaths = res.tempFilePaths[0]
        console.log(res.tempFilePaths[0])
        wx.uploadFile({
          // url: 'https://albert3306.utools.club/api/upload/image',
          url:'https://www.zhuohanghuigou.cn/api/upload/image',
          filePath: tempFilePaths,
          name: 'file',
          header: {
            'Authori-zation': 'Bearer ' + wx.getStorageSync('token')
          },
          success:(res) =>{
            console.log('图片上传成功', JSON.parse(res.data));
            let r=JSON.parse(res.data)
            console.log(r.data.name)
            let FormData={
              // name:r.data.name,
              receiving_qr_img:r.data.url
            }
            app.$apis('/user/edit','POST',FormData).then(
              res=>{
                console.log('更新图片成功',res)
                this.getData()
              }
            )
          },
        },
        )
      }
    })
  }, 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */

})