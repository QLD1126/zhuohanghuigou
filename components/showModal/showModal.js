// components/ShowModal/ShowModal.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    //  样式全局生效
    addGlobalClass: true
  },
  properties: {
    innerText: {
      type: String,
      value: 'default value'
    },
    currentText: {
      type: String
    },
    isShow:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // showModal: true,
    // modal:'pro'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 弹窗
    meShowModal() {
      this.triggerEvent('meShowModal',{
        isShow:this.properties.ishow
      })
      console.log('出弹窗')
    },
    // 弹出模板层阶段touchmove事件
    preventTouchMove() {

    },
    // 隐藏静态对话框
    isHideModal() {
      this.setData({
        isShow:!this.properties.isShow
      })
      console.log('组件已隐藏')
    },
    // 取消点击事件
    meCancel() {
      this.isHideModal()
      console.log('取消了')
    },
    // 点击确定
    meConfirm() {
      this.isHideModal()
      console.log('确定了')
    }
  },

})
