//usercenter.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");
const util = require("../../utils/util.js");
Page({
  data: {
    userInfo: {},
    genderArray: [
      {
        id: 0,
        name: '男'
      },
      {
        id: 1,
        name: '女'
      }
    ]
  },
  onLoad: function () {
    this.getUserInfo();
  },
  getUserInfo: function(){
    req.request('/app/member/profile', {
      method: 'post',
      data: {
      }
    }).then((res) => {
      this.setData({
        userInfo: res.data,
      })
    });
  },
  bindNameChange: function(e){
    this.setData({
      ['userInfo.name']: e.detail.value
    })
  },
  bindDateChange: function(e){
    this.setData({
      ['userInfo.birthday']: e.detail.value
    })
  },
  bindGenderChange: function(e){
    this.setData({
      ['userInfo.gender']: e.detail.value
    }) 
  },
  bindNickNameChange: function(e){
    this.setData({
      ['userInfo.nickName']: e.detail.value
    }) 
  },
  bindMobileChange: function(e){
    this.setData({
      ['userInfo.mobile']: e.detail.value
    }) 
  },
  bindSchoolChange: function(e){
    this.setData({
      ['userInfo.school']: e.detail.value
    }) 
  },
  updateUserInfo: function(){
    let params = this.data.userInfo;
    if(!params.name){
      util.showToast('请输入姓名');
      return false;
    }
    // if(!params.nickName){
    //   util.showToast('请输入昵称');
    //   return false;
    // }
    if(!params.birthday){
      util.showToast('请选择出生日期');
      return false;
    }
    // if(!params.gender){
    //   util.showToast('请选择性别');
    //   return false;
    // }
    if(!params.mobile){
      util.showToast('请输入手机号');
      return false;
    }
    if(!util.isMobile(params.mobile)){
      util.showToast('手机号格式不正确');
      return false;
    }
    if(!params.school){
      util.showToast('请输入学校');
      return false;
    }
    util.showLoading('加载中...');
    req.request('/app/member/updateMember', {
      method: 'post',
      data: params
    }).then((res) => {
      util.hideLoading();
      util.showToast('保存成功！')
      setTimeout(function(){
        wx.navigateBack({
        })
      }, 1000);
    });
  }
})
