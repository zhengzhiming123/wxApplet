//gradation.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");

Page({
  data: {
    type: '',
    gradeList: []
  },
  onLoad: function (options) {
    this.data.type = options.type||'';
    this.getGradeList();
  },
  getGradeList: function(){
    req.request('/app/grade/list', {
      method: 'post',
      data: {}
    }).then((res) => {
      this.setData({
        gradeList: res.list
      })
    });
  },
  gotoNext: function(e){
    let url = '';
    if(this.data.type=='class'){
      url = '../classes/classes';
    }else{
      url = '../gradeinfo/gradeinfo'
    }
    wx.navigateTo({
      url: url+'?id='+e.currentTarget.dataset.id
    })
  }
})
