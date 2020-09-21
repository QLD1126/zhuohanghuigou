// compoents/noBuy/noBuy.js
const app=getApp()
Component({
  /**
   * 组件的属性列表
   */
  options:{
    addGlobalClass:true
  },
  properties: {
    innerText:{
      type:String,
      value:'default value'
    },
    currentText:{
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // is_pay:app.globalData.is_pay
    phone:wx.getStorageSync('userInfo').pay_auth_phone
    // phone:app.globalData.pay_auth_phone
  },

  /**
   * 组件的方法列表
   */
  methods: {
    call(){
      console.log('打电话')
      wx.makePhoneCall({
        phoneNumber: this.data.phone,
      })
    }
  }
})
