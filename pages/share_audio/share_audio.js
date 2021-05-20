//share_audio.js
//获取应用实例
const app = getApp()
const util = require("../../utils/util.js");
const req = require("../../utils/request.js");
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.src = '/images/1.mp3'
Page({
  data: {
    id: '',
    member: {},
    workInfo: {},
    //播放音频
    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    //点赞
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
      this.audioInitialization();
      this.loadaudio();
    });
  },
  audioInitialization:function(data){
    let that = this;
    innerAudioContext.src = this.data.workInfo.url;
    innerAudioContext.play();
    innerAudioContext.pause();
    innerAudioContext.onCanplay(()=>{
      innerAudioContext.duration;
      setTimeout(function(){
        var duration = innerAudioContext.duration;
        var min = parseInt(duration/60);
        var sec = parseInt(duration%60);
        if(min.toString().length == 1){
          min = `0${min}`;
        }
        if(sec.toString().length == 1){
          sec = `0${sec}`;
        }
        that.setData({
          audioDuration:innerAudioContext.duration,
          showTime2: `${min}:${sec}`
        })
      },1000)
    })
  },
  sliderChange(e){
    var that = this;
    innerAudioContext.src = this.data.workInfo.url;
    var value = e.detail.value;
    this.setData({
      audioTime: value
    });
    var duration = this.data.audioDuration;
    value = parseInt(value*duration/100);
    this.setData({
      audioSeek: value, 
      isPlayAudio: true
    });
    innerAudioContext.seek(value);
    innerAudioContext.play();
  },
  playAudio(){
    var isPlayAudio = this.data.isPlayAudio;
    var seek = this.data.audioSeek;
    innerAudioContext.pause();
    this.setData({
      isPlayAudio: !isPlayAudio
    })
    if(isPlayAudio){
      this.setData({
        audioSeek: innerAudioContext.currentTime
      })
    }else{
      innerAudioContext.src = this.data.workInfo.url;
      if(innerAudioContext.duration != 0){
        this.setData({
          audioDuration: innerAudioContext.duration
        })
      }
      innerAudioContext.seek(seek);
      innerAudioContext.play();
    }
  },
  loadaudio(){
    var that = this;
    this.data.durationIntval = setInterval(function(){
      if(that.data.isPlayAudio==true){
        var seek = that.data.audioSeek;
        var duration = innerAudioContext.duration;
        var time = that.data.audioTime;
        time = parseInt(100*(seek+1)/duration);
        var min = parseInt((seek+1)/60);
        var sec = parseInt((seek+1)%60);
        if (min.toString().length == 1) {
          min = `0${min}`;
        }
        if (sec.toString().length == 1) {
          sec = `0${sec}`;
        }
        var min1 = parseInt(duration/60);
        var sec1 = parseInt(duration%60);
        if(min1.toString().length ==1){
          min1 = `0${min1}`;
        }
        if(sec1.toString().length ==1){
          sec1 = `0${sec1}`;
        }
        if(time>=100){
          innerAudioContext.stop();
          that.setData({
            audioSeek:0,
            audioTime: 0,
            audioDuration: duration,
            isPlayAudio:false,
            showTime1: `00:00`
          })
          return false;
        }
        that.setData({
          audioSeek: seek+1,
          audioTime: time,
          audioDuration:duration,
          showTime1: `${min}:${sec}`, 
          showTime2: `${min1}:${sec1}`
        })
      }
    },1000)
  },
  onUnload: function(){
    clearInterval(this.data.durationIntval);
    innerAudioContext.stop();
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
  }
})
