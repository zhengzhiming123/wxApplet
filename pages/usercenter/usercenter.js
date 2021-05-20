//usercenter.js
//获取应用实例
const app = getApp();
const req = require("../../utils/request.js");
Page({
  data: {
    userInfo: {}
  },
  onLoad: function () {
    
  },
  onShow: function() {
    this.getUserInfo();

    this.selectComponent("#checkIn").check();
  },
  getUserInfo: function(){
    req.request('/app/member/profile', {
      method: 'post',
      data: {
      }
    }).then((res) => {
      this.setData({
        userInfo: res.data
      })
    });
  },
  gotoHomework: function(e) {
    wx.navigateTo({
      url: '../task_history/task_history',
    })
  },
  gotoIntegral: function(e) {
    wx.navigateTo({
      url: '../integral/integral',
    })
  },
  gotoUserInfo: function(e) {
    wx.navigateTo({
      url: '../userinfo/userinfo?id='+this.data.userInfo.id
    })
  },
  gotoEnroll: function(e){
    wx.navigateTo({
      url: '../my_enroll/my_enroll?id='+this.data.userInfo.id
    })
  },
  loginOut: function(){
    wx.showModal({
      title: '退出确认',
      content: '确认退出吗？',
      success (res) {
        if (res.confirm) {
          wx.clearStorage();
          wx.navigateTo({
            url: '../login/login'
          })
        } else if (res.cancel) {
        }
      }
    })
  }
})
