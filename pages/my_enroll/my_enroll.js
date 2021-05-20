//index.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");
Page({
  data: {

  },
  onLoad: function () {
  },
  gotoDetail () {
    wx.navigateTo({
      url: '../enroll_detail/enroll_detail',
    })
  }
})
