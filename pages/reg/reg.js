//index.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");
const util = require("../../utils/util.js");
Page({
  data: {
    user: {
      openId: '',
      unionId: '',
      username: '',     //学生姓名
      birthday: '',     //出生日期
      gender: 0,        //性别
      schoolName: '',   //学校
      mobile: '',       //手机号码
      verifyCode: '',   //验证码

      userType: 1,      //类型 1：游客 2 学员
      gradeId: '',      //学习阶段
      classId: '',      //学习班级
      code: '',         //邀请码
    },
    showCountDown: false,
    countDownSecond: 60,
    gradeList: [],
    gradeIndex: 0,
    classesList: [],
    classesIndex: 0
  },
  onLoad: function () {
    let that = this;
    wx.login({
      success: function(res){
        that.data.userCode = res.code;
        that.getOpenId();
      }
    });

    this.getGradeList();
  },
  getOpenId: function(){
    let that = this;
    req.request('/app/getOpenId', {
      method: 'post',
      data: {
        code: this.data.userCode
      }
    }).then((res) => {
      if(res.code == 0){
        that.data.user.openId = res.data.openId
      }
    });
  },
  changeName: function(e) {
    this.data.user.name = e.detail.value;
  },
  bindDateChange: function(e){
    this.data.user.birthday = e.detail.value;
    this.setData({
      user : this.data.user
    })
  },
  radioChange: function(e){
    this.data.user.gender = e.detail.value;
  },
  changeSchool: function(e) {
    this.data.user.schoolName = e.detail.value;
  },
  radioTypeChange: function(e){
    this.data.user.userType = e.detail.value;
    this.setData({
      user: this.data.user
    })
  },
  changeMobile: function(e) {
    this.data.user.mobile = e.detail.value;
  },
  changeVerifyCode: function(e){
    this.data.user.verifyCode = e.detail.value;
  },
  changeCode: function(e) {
    this.data.user.code = e.detail.value;
  },
  sendSms: function(){
    let that = this;
    if (!util.isMobile(this.data.user.mobile)) {
      util.showToast('手机号错误');
      return false;
    }

    wx.login({
      success(res) {
        if (res.code) {
          that.requestCode(res.code);
        }
      }
    })
  },
  requestCode: function(code) {
    let that = this;
    util.showLoading('发送中...');
    req.request('/app/registerCode', {
      method: 'post',
      data: {
        mobile: this.data.user.mobile
      }
    }).then((res) => {
      util.hideLoading();
      util.showToast('验证码已发送');
      let countDownNum = this.data.countDownSecond;
      this.setData({
        showCountDown: true
      });
      let timer = setInterval(function () {
        countDownNum--;
        that.setData({
          countDownSecond: countDownNum
        })
        if (countDownNum == 0) {
          clearInterval(timer);
          that.setData({
            countDownSecond: 60,
            showCountDown: false
          })
        }
      }, 1000)
    });
  },
  doReg: function(res){
    if (res.detail.errMsg != "getUserInfo:ok") {
      util.showToast('需要授权才能完成注册');
      return;
    }
    let user = this.data.user;
    user.avatar = res.detail.userInfo.avatarUrl;
    //类型 1：游客 2 学员
    if (user.userType == 1) {
      user.classId = '';
      user.code = '';
      user.gradeId = '';
    }
  
    let flag = this.validateParam(user);
    if(flag) {
      req.request('/app/register', {
        method: 'post',
        data: user
      }).then((res) => {
        if(res.code == 0){
          util.showToast('注册成功');
          setTimeout(function(){
            wx.navigateBack({
            })
          }, 1000);
        }
      });
    }
  },
  validateParam: function(data){
    if(!data.name){
      util.showToast('请输入姓名');
      return false;
    }
    if(!data.birthday){
      util.showToast('请选择出生日期');
      return false;
    }
    if(!data.mobile){
      util.showToast('请输入手机号码');
      return false;
    }
    if(!data.verifyCode){
      util.showToast('请输入验证码');
      return false;
    }
    if(data.userType==2){
      if(!data.gradeId){
        util.showToast('请选择阶段');
      return false;
      }
      if(!data.classId){
        util.showToast('请选择班级');
      return false;
      }
    }
    return true;
  },
  getGradeList: function() {
    req.request('/app/grade/list', {
      method: 'post',
      data: {}
    }).then((res) => {
      let temp = {name: '请选择学习阶段',id: ''};
      res.list.unshift(temp);
      this.setData({
        gradeList: res.list
      });
    });
  },
  bindLevelChange: function(e){
    let gradeId = this.data.gradeList[e.detail.value].id;
    this.data.user.gradeId = gradeId;
    this.setData({
      gradeIndex: e.detail.value
    })
    this.refreshClasses(gradeId);
  },
  refreshClasses: function (gradeId){
    if(gradeId){
      req.request('/app/class/listByGradeId', {
        method: 'post',
        data: {
          'gradeId': gradeId
        }
      }).then((res) => {
        this.setData({
          'classesList': res.list
        })
        if (res.list.length > 0) {
          this.data.user.classId = res.list[0].id;
        }
      });
    }else{
      this.setData({
        'classesList': []
      })
    }
  },
  bindClassesChange: function(e){
    let classId = this.data.classesList[e.detail.value].id;
    this.data.user.classId = classId;
    this.setData({
      classesIndex: e.detail.value
    })
  }
})
