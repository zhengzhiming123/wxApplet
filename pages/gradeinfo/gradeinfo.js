//gradeinfo.js
//获取应用实例
const app = getApp();
const req = require("../../utils/request.js");

Page({
  data: {
    id: '',
    name: '',
    gradeInfo: {},
    courseList: []
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    });
    this.getCourstList();
  },
  getCourstList: function(){
    req.request('/app/course/listByGradeId', {
      method: 'post',
      data: {
        gradeId: this.data.id
      }
    }).then((res) => {
      this.setData({
        gradeInfo: res.grade,
        courseList: res.list
      })
    });
  }
  
})
