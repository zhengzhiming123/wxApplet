//student.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");
Page({
  data: {
    classId: '',
    gradeInfo: {},
    classInfo: {},
    studentList: []
  },
  onLoad: function (options) {
    this.data.classId = options.id;
    this.getStudentList();
  },
  getStudentList: function(){
    req.request('/app/member/listByClassId', {
      method: 'post',
      data: {
        classId: this.data.classId
      }
    }).then((res) => {
      this.setData({
        gradeInfo: res.grade,
        classInfo: res.class,
        studentList: res.list
      })
    });
  }
})
