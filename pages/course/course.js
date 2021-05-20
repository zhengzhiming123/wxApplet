//course.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");

Page({
  data: {
    id: '',
    courseInfo: {},
    lessonList: []
  },
  onLoad: function (options) {
    this.data.id = options.id;
  },
  onShow: function() {
    this.getLessonInfo();
  },
  getLessonInfo: function(){
    return req.request('/app/courseLesson/listByCourseId', {
      method: 'post',
      data: {
        courseId: this.data.id
      }
    }).then((res) => {
      //console.log(res)
      this.setData({
        courseInfo: res.course,
        lessonList: res.list
      })
    });
  },
  getCourseList: function(){
    req.request('/app/courseLesson/listByCourseId', {
      method: 'post',
      data: {
        courseId: this.data.lessonInfo.id
      }
    }).then((res) => {
      this.setData({
        courseList: res.list
      })
    });
  },
  gotoStudy: function(e){
    let id = e.currentTarget.dataset.id;
    //判断是否可以学习
    /* req.request('/app/courseLesson/canLearning', {
      method: 'post',
      data: {
        id: id
      }
    }).then((res) => {
      console.log(res)
    }); */
    wx.navigateTo({
      url: '/pages/lesson_view/lesson_view?id='+id
    });
  }
})
