//checkin.js
//获取应用实例
let app = getApp();
const req = require("../../utils/request.js");
const util = require('../../utils/util.js');
Component({
  properties: {

  },
  ready: function() {
    
  },
  data: {
    // 这里是一些组件内部数据
    showCheckIn: false,
    isSignIn: true,
    isPost: false
  },
  methods: {
    check: function() {
      let signDate = app.globalData.signDate;
      let date = (new Date()).Format("yyyy-MM-dd");
      if (signDate && date != signDate) {
        //已签到
        this.setData({
          isSignIn: true
        })
      } else {
        //检查是否签到
        this.isCheckIn();
      }
    },
    // 这里是一个自定义方法
    closeSignin: function(){
      // this.setData({
      //   showCheckIn: false
      // })
    },
    showCheckinPanel: function(){
      this.doCheckIn();
      // this.setData({
      //   showCheckIn: true
      // })
    },
    isCheckIn: function() {
      req.request('/app/checkin/isCheckin', {
        method: 'post',
        data: {}
      }).then((res) => {
        if (res.isCheckin) {
          app.globalData.signDate = (new Date()).Format('yyyy-MM-dd');
          this.setData({
            isSignIn: true,
            showCheckIn: false
          })
        } else {
          app.globalData.signDate = '';
          this.setData({
            isSignIn: false,
            showCheckIn: true
          })
        }
      });
    },
    doCheckIn: function(){
      if (this.data.isPost) {
        return;
      }
      this.data.isPost = true;
      util.showLoading('签到中...');
      req.request('/app/checkin/checkin', {
        method: 'post',
        data: {}
      }).then((res) => {
        util.hideLoading();
        app.globalData.signDate = (new Date()).Format('yyyy-MM-dd');
        this.setData({
          isSignIn: true,
          showCheckIn: false,
          isPost: false
        })
        wx.showToast({
          title: '签到成功'
        })
      });
    }
  }
})
