//course_view.js
//获取应用实例
const app = getApp()
const util = require("../../utils/util.js");
const req = require("../../utils/request.js");
const videoContext = wx.createVideoContext('coursevideo');

Page({
  data: {
    id: '',
    member: {},
    workInfo:{},
    openId: '',
    supportFlag: true,
    showHomeBtn: true
  },
  onLoad: function (options) {
    if (options.scene) {
      this.setData({
        id: options.scene
      });
    }else{
      this.setData({
        id: options.id,
        showHomeBtn: false
      });
    }
    this.getWorkInfo();
    this.getOpenId();
  },
  getOpenId: function(){
    let that = this;
    wx.login({
      success: res =>{
        let code = res.code;
        if(code){
          req.request('app/getOpenId', {
            method: 'post',
            data: {
              code: code
            }
          }).then((res) => {
            let openId = res.data.openId;
            this.data.openId = openId;
            that.getIsLike(openId);
          });
        }
      }
    })
  },
  getIsLike: function(openId){
    req.request('app/work/islike', {
      method: 'post',
      data: {
        openId: openId,
        workId: this.data.id
      }
    }).then((res) => {
      this.setData({
        supportFlag: res.isLike
      })
    });
  },
  getWorkInfo:function(){
    req.request('app/work/detail', {
      method: 'post',
      data: {
        id: this.data.id
      }
    }).then((res) => {
      this.setData({
        member: res.data.member,
        workInfo:res.data.work
      });
    });
  },
  supportWork: function(){
    if(!this.data.supportFlag){
      req.request('app/work/like', {
        method: 'post',
        data: {
          openId: this.data.openId,
          workId: this.data.id
        }
      }).then((res) => {
        let likeNum = parseInt(this.data.workInfo.likeNum)+1;
        this.setData({
          supportFlag: true,
          ['workInfo.likeNum']: likeNum
        });
      });
    }else{
      util.showToast('已经点赞过了哦')
    }
  },
  enterHome: function(){
    wx.switchTab({
      url: '../index/index'
    })
  },
  onUnload: function(){
    videoContext.stop();
  }
})
