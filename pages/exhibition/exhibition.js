//index.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");
Page({
  data: {
    workList: [],
    curWork: {},
    showLayer: false,
    showShareLayer: false,
    curShareType: '',
    curShareId: '',
    showFcircleLayer: false,
    share_image_url: ''
  },
  onLoad: function () {
    this.getWorkList();
  },
  onShow: function() {
    this.selectComponent("#checkIn").check();
  },
  getWorkList: function(){
    req.request('/app/work/top', {
      method: 'post',
      data: {
      }
    }).then((res) => {
      this.setData({
        workList: res.list
      })
    });
  },
  showWork: function(e){
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let url = '';
    if(type == 1){
      url = '/pages/share_video/share_video?id='+id;
    }else{
      url = '/pages/share_audio/share_audio?id='+id;
    }
    wx.navigateTo({
      url: url
    })
    /* let info = {
      type: e.currentTarget.dataset.type,
      url: e.currentTarget.dataset.url,
      lesson: e.currentTarget.dataset.lesson,
      course: e.currentTarget.dataset.course
    };
    this.setData({
      showLayer: true,
      curWork: info
    })
    if(info.type == 1){
      this.videoContext = wx.createVideoContext(id, this);
      this.videoContext.requestFullScreen({
        direction: 0
      });
      this.videoContext.play();
    } */

  },
  closeLayer: function(){
    this.setData({
      showLayer: false,
      curWork: {}
    });
    wx.stopVoice();
  },

  onShareAppMessage: function (res) {
    let id = this.data.curShareId;
    let type = this.data.curShareType;
    let path = '';
    if (type == 1) {
      path = '/pages/share_video/share_video?scene=' + id;
    } else {
      path = '/pages/share_audio/share_audio?scene=' + id;
    }
    return {
      title: '言之有道',
      path: path,//这里填写首页的地址,一般为/pages/xxxx/xxx
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功'
        })
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '转发失败，请重试',
          icon: 'none'
        })
      }
    }
  },
  chooseShareType: function(e){
    this.data.curShareId = e.currentTarget.id;
    this.data.curShareType = e.currentTarget.dataset.type;
    this.setData({
      showShareLayer: true
    })
  },
  closeShareLayer: function(){
    this.setData({
      showShareLayer: false
    })
  },
  shareFriendCirlce: function(){
    wx.showLoading({
      title: '生成图片中...',
    });
    let that = this;
    req.request('app/work/shareImage', {
      method: 'post',
      data: {
        id: that.data.curShareId
      }
    }).then((res) => {
      wx.hideLoading();
      that.setData({
        showFcircleLayer: true,
        'share_image_url': res.url
      })
    });
  },
  handleCloseFcircleLayer: function(){
    this.setData({
      showFcircleLayer: false
    })
  },
  handleSaveShareImg: function(){
    let that = this;
    wx.getImageInfo({
      src: that.data.share_image_url,
      success: function (sres) {
        wx.saveImageToPhotosAlbum({
          filePath: sres.path,
          success: function (fres) {
            wx.showToast({
              icon: 'none',
              title: '分享图片已保存至相册',
              duration: 2000
            });
            that.handleCloseFcircleLayer();
          }
        })
      }
    });
  },
  playAudio: function(e){
    let that = this;
    let url = e.currentTarget.dataset.url;
    wx.playVoice({
      filePath: url,
      complete () { }
    })
  }
})
