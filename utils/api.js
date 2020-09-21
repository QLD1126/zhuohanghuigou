// const baseUrl = 'http://192.168.3.48/api'
// const baseUrl = 'https://albert3306.utools.club/api'
const baseUrl = 'https://www.zhuohanghuigou.cn/api'

const $request = (url,method = 'POST' , data, contentType = 2) => {
  let contentTypes = contentType == 1 ? 'application/json; charset=utf-8' : 'application/x-www-form-urlencoded'
  return new Promise(function (resolve, reject) {
    wx.request({
      url: baseUrl + url,
      method: method,
      data: data,
      header: {
        'Content-Type': contentTypes,
        'Authori-zation': 'Bearer ' +wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.statusCode == 200) {
          resolve(res)
          if (res.data.status == 400) {
            wx.showToast({
              icon: 'none',
              title: res.data.msg,
              duration: 1500
            });
          } else if (res.data.status == 410000) {
            console.log(wx.getStorageSync('token'))
            wx.showToast({
              icon: 'none',
              title: res.data.msg,
              duration: 1500
            });
          }
        }
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}

// 封装的请求方法需要暴露出去
module.exports = $request