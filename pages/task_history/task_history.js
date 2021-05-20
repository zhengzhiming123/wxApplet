//task_history.js
//获取应用实例
const app = getApp();
const req = require("../../utils/request.js");
const util = require("../../utils/util.js");
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    memberId:'',
    openId: '',
    reqUrl: '',
    page: 1,
    totalpages: 1,
    serviceData: {
      'limit' : 10,
      'page'  : 1
    },
    taskHistory: [],
    currentAudioId: '',
    playFlag: false,
    showShareLayer: false,
    showFcircleLayer: false,
    share_image_url: ''
  },
  onLoad: function (options) {
    if(options.id){
      this.data.memberId = options.id;
      this.data.reqUrl = '/app/work/work';
      this.data.serviceData.memberId = options.id;
    }else{
      this.data.reqUrl = '/app/work/mine';
    }
    this.getTaskHistory();
    this.getOpenId();
    
    //音频播放 
    innerAudioContext.onPlay(() => {
      this.setData({
        playFlag: true
      });
    });
    innerAudioContext.onPause(() => {
      this.setData({
        playFlag: false
      });
    });
    innerAudioContext.onStop(() => {
      this.setData({
        playFlag: false
      });
    });
  },
  getOpenId() {
    let that = this;
    wx.login({
      success: res => {
        let code = res.code;
        if (code) {
          req.request('app/getOpenId', {
            method: 'post',
            data: {
              code: code
            }
          }).then((res) => {
            this.data.openId = res.data.openId;
          });
        }
      }
    })
  },
  //点赞
  onLike: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    req.request('app/work/like', {
      method: 'post',
      data: {
        openId: this.data.openId,
        workId: id
      }
    }).then((res) => {
      if(res.code == 0) {
        util.showToast('点赞成功');
        this.data.taskHistory[index].likeNum += 1;
        this.setData({
          taskHistory: that.data.taskHistory
        })
      }
    });
  },
  onReachBottom: function () {
    var that = this;
    // 获取数据
    var page = parseInt(that.data.page) + 1;
    if (!page || page > that.data.totalpages) {
      that.setData({
        onload: "再拉也没有了"
      })
    } else {
      that.setData({
        'page': page,
        'serviceData.page': page,
      });
      // 获取课程列表数据
      that.getTaskHistory();
    }
  },
  getTaskHistory: function(){
    let that = this;
    req.request(this.data.reqUrl, {
      method: 'post',
      data: this.data.serviceData
    }).then((res) => {
      res.data.list.forEach(element => {
        let date = element.finishDate.split(' ')[0];
        element.formatDate = date;
      });
      that.setData({
        totalpages: res.data.totalPage,
        taskHistory: that.data.taskHistory.concat(res.data.list),
      })
    });
  },
  playAudio: function(e){
    let id = e.currentTarget.dataset.id;
    let url = e.currentTarget.dataset.url;
    if(this.data.currentAudioId != id){
      this.setData({
        currentAudioId: id
      })
      innerAudioContext.src = url;
    }
    if (innerAudioContext.paused){
      innerAudioContext.play()
    }else{
      innerAudioContext.pause()
    }
  },
  videoPlay: function(e){
    let id = e.currentTarget.id;
    let videoContext = wx.createVideoContext(id, this);
    videoContext.requestFullScreen({
      direction: 0
    });
    //videoContext.play();
  },
  onShareAppMessage:function(res){
    let id = res.target.id;
    let type = res.target.dataset.type;
    let path = '';
    if(type == 1){
      path = '/pages/share_video/share_video?scene='+id;
    }else{
      path = '/pages/share_audio/share_audio?scene='+id;
    }
    return {
      title: '言之有道',   
      path: path,//这里填写首页的地址,一般为/pages/xxxx/xxx
      success: function(res) {
        // 转发成功
        wx.showToast({
          title:'转发成功'
        })
      },
      fail: function(res) {
        // 转发失败
        wx.showToast({
          title:'转发失败，请重试',
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
  onUnload: function(){
    innerAudioContext.stop();
  }
})
