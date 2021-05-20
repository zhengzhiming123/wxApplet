const req = require("../../utils/request.js");
const util = require("../../utils/util.js");
const cache = require("../../utils/cache.js");

Page({
  data: {
    isStudent: false,
    gradeId: '',
    gradeName: '',
    bannerList: [],
    gradeInfo: {},
    courseList: [],
    gradeList: []
  },
  onLoad: function () {
    this.getBanner();
  },
  onShow: function() {
    this.profile()
    .then(res => {
      if (this.data.isStudent) {
        this.getCourseList();
      } else {
        this.getGradeList();
      }
    });
    this.selectComponent("#checkIn").check();
  },
  //获取banner
  getBanner: function() {
    req.request('/app/banner/list', {
      method: 'post',
      data: {}
    }).then((res) => {
      this.setData({
        bannerList: res.list
      })
    });
  },
  //获取用户信息
  profile: function() {
    return req.request('/app/member/profile', {
      method: 'post',
      data: {}
    }).then((res) => {
      this.setData({
        isStudent: res.data.isStudent == 1,
        gradeId: res.data.gradeId,
        gradeName: res.data.gradeName || ''
      })
    });
  },
  //（学生）获取用户就读阶段、课程信息
  getCourseList: function() {
    req.request('/app/course/listByGradeId', {
      method: 'post',
      data: {
        gradeId: this.data.gradeId
      }
    }).then((res) => {
      this.setData({
        gradeInfo: res.grade,
        courseList: res.list
      })
    });
  }, 
  //（游客）获取全部阶段
  getGradeList: function() {
    req.request('/app/grade/list', {
      method: 'post',
      data: {}
    }).then((res) => {
      this.setData({
        gradeList: res.list
      })
    });
  },

  //课程列表
  gotoGrade: function(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../gradeinfo/gradeinfo?id=' + id
    })
  },
})
