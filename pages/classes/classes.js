//classes.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");
Page({
  data: {
    gradeId: '',
    gradeInfo: {},
    classesList: []
  },
  onLoad: function (options) {
    this.data.gradeId = options.id;
    this.getClassesList();
  },
  getClassesList: function(){
    req.request('/app/class/listByGradeId', {
      method: 'post',
      data: {
        gradeId: this.data.gradeId
      }
    }).then((res) => {
      this.setData({
        gradeInfo: res.grade,
        classesList: res.list
      })
    });
  }
})
