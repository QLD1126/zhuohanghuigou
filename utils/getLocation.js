// const QQMapWX = require('../libs/qqmap-wx-jssdk');
// var qqmapsdk = new QQMapWX({key: 'HIMBZ-S3J3X-5TD4K-76CR5-H4HJS-RGB2U'});getMeLocation(){
//   //用微信提供的api获取经纬度
//   wx.getLocation({
//     type: 'wgs84',
//     success: function (res) {
//       console.log(res)
//       that.setData({
//         myLatitude: res.latitude, myLongitude: res.longitude
//       })
//     }
//   })
//   //用腾讯地图的api，根据经纬度获取城市
//   qqmapsdk.reverseGeocoder({
//     // location: {
//     //   myLatitude: that.data.latitude,
//     //   myLongitude: that.data.longitude
//     // },
//     success: function (res) {
//       console.log(res)
//       var a = res.result.address_component
//       //获取市和区（区可能为空）
//       // that.setData({ myAddress: a.city + a.district })
//       //控制台输出结果
//       console.log(that.data.myAddress)
//       console.log(a.district)
//       //根据地址解析在地图上标记解析地址位置
//       that.setData({ // 获取返回结果，放到markers及poi中，并在地图展示
//         myAddress: a.city + a.district,
//         markers: [{
//           id: 0,
//           title: res.street_number,
//           latitude: that.data.myLatitude,
//           longitude: that.data.myLongitude,
//           iconPath: 'https://lbs.qq.com/product/miniapp/jssdk/img/u108.png',//图标路径
//           width: 20,
//           height: 20,
//           callout: { //可根据需求是否展示经纬度
//             content: a.district + ',' + a.street,
//             color: '#000',
//             display: 'ALWAYS'
//           }
//         }],
//         poi: { //根据自己data数据设置相应的地图中心坐标变量名称
//           latitude: that.data.myLatitude,
//           longitude: that.data.myLongitude
//         }
//       });
//       console.log(that.data.markers)
//     }
//   })
// }