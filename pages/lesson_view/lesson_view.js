//course_view.js
//获取应用实例
const app = getApp()
const util = require("../../utils/util.js");
const req = require("../../utils/request.js");
const COS = require('../../utils/cos-wx-sdk-v5.js');
const tempAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    navIndex: 0,    // 0 视频， 1：音频， 2：图片 3：文字
    navNum: 0,
    id: '',
    lessonInfo: {},
    work: {},
    showLayer: false,
    showLoading: true,
    showCameraLayer: false,   //是否显示录制视频弹层
    isRecording: false,       //是否正在录制视频
    startSpeaking: false,     //开始录制音频
    duration: 0,              //持续时间
    durationTime: '00:00',
    tempSrc: '',              //录制音频、视频临时文件地址
    tempThumbPath: '',
    isRecordFinish: false,     //是否录制音频、视频结束
    timer: null,
    //播放音频
    innerAudioContext: null,
    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    submitWorkId: '',

    showShareLayer: false,
    showFcircleLayer: false,
    share_image_url: ''
  },
  onLoad: function (options) {
    this.data.id = options.id;
  },
  onShow: function() {
    this.getLessonInfo();
  },
  onReady: function(){
    // if (wx.createCameraContext()) {
    //   this.cameraContext = wx.createCameraContext('myCamera')
    // } else {
    //     wx.showModal({
    //     title: '提示',
    //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    //   })
    // }
  },
  changeNav: function(e){
    var idx = e.currentTarget.dataset.index;
    this.setData({
      navIndex: idx
    })
  },
  getLessonInfo: function(){
    let that = this;
    req.request('/app/courseLesson/lesson', {
      method: 'post',
      data: {
        id: this.data.id
      }
    }).then((res) => {
      let navIndex = 0;
      let navNum = res.data.isVideo + res.data.isVoice + res.data.isImage + res.data.isText;
      if(res.data.isVideo==1){
        navIndex = 0;
      }else if(res.data.isVoice==1){
        //音频
        navIndex = 1;
      }else if(res.data.isImage == 1){
        navIndex = 2;
      }else{
        navIndex = 3;
      }

      if(res.data.isVoice==1){
        this.data.innerAudioContext = wx.createInnerAudioContext();
        that.audioInitialization(res.data);
        that.loadaudio();
      }
      
      if (res.data.isImage == 1) {
        res.data.arrImages = [];
        let images = res.data.imageUrl.split(',');
        images.forEach(it => {
          if (it) {
            res.data.arrImages.push(it);
          }
        })
      } 
      this.setData({
        navIndex: navIndex,
        lessonInfo: res.data,
        work: res.work,
        navNum: navNum
      })
    });
  },
  submitWork: function(){
    let workType = this.data.lessonInfo.workType;
    //提交 已阅
    if(workType == 0){
      this.setData({
        showLayer: true,
        showLoading: true
      });
      this.doSubmit('');
    }

    //提交视频
    if(workType == 1){
      this.setData({
        showCameraLayer: true,
      })
    }
  },
  closeLayer: function(){
    this.getLessonInfo();
    this.setData({
      showLayer: false
    })
  },
  //开始录像，最长30秒
  startVideoRecord: function(){
    util.showToast('开始录制视频');
    let that = this;
    this.cameraContext.startRecord({
      success: function (res) {
        that.setData({
          isRecording: true,
        });
        that.data.timer = setInterval(function(){
          let duration = that.data.duration + 1;
          if(duration > 30){
            that.stopRecord();
          }else{
            that.formatTime(duration);
            that.setData({
              duration: duration
            })
          }
        }, 1000);
      },
      fail: function (res) {
        util.showToast('开始录像失败！')
      },
      complete: function (res) {
      },
      timeoutCallback: function (res) {
      }
    })
  },
  stopRecord: function(){
    util.showToast('视频录制已停止');
    let that = this;
    this.cameraContext.stopRecord({
      success: function(res){
        clearInterval(that.data.timer);
        that.data.duration = 0;
        that.setData({
          isRecording: false,
          isRecordFinish: true,
          showCameraLayer: false,
          tempFile: res
        });
      },
      fail: function(res){
      }
    })
  },
  chooseVideo: function(){
    let that = this;
    wx.chooseVideo({
      maxDuration: 60,
      success: function(res){
        that.data.tempFile = res;
        that.uploadFile();
      },
      fail: function(res){
        if (res.errMsg != 'chooseVideo:fail cancel') {
          util.showModal('失败提示', res.errMsg);
        }
      }
    })
  },
  startVoiceRecord: function(){
    let that = this;
    let recorderManager = wx.getRecorderManager();
    recorderManager.start({
      duration: 300000,
      format: 'mp3'
    });
    recorderManager.onStart(() => {
      that.setData({
        startSpeaking: true
      });
      that.data.timer = setInterval(function(){
        let duration = that.data.duration + 1;
        that.formatTime(duration);
        that.setData({
          duration: duration
        })
      }, 1000);
    })
    recorderManager.onStop((res) => {
      that.setData({
        startSpeaking: false,
        isRecordFinish: true,
        tempFile: res,
        duration: 0
      });
      clearInterval(that.data.timer);
    })
  },
  stopVoiceRecord: function(){
    let recorderManager = wx.getRecorderManager();
    recorderManager.stop();
  },
  uploadFile: function(){
    this.setData({
      showLayer: true,
      showLoading: true
    });
    let that = this;
    var filePath = this.data.tempFile.tempFilePath || this.data.tempFile.tempVideoPath;
    var formatName = filePath.substr(filePath.lastIndexOf('.') + 1);
    var filename = "upload/" + new Date().Format("yyyy-MM-dd") + "/" + util.getGuid() + "." + formatName;
    var cos = new COS({
      SecretId: app.globalData.cos.secretId,
      SecretKey: app.globalData.cos.secretKey,
    });
    cos.postObject({
        Bucket: app.globalData.cos.bucket,
        Region: app.globalData.cos.region,
        Key: filename,
        FilePath: filePath,
        onProgress: function (info) {
          
        },
        success: function(res) {
        }
    }, function (err, data) {
        that.doSubmit("http://" + data.Location)
    });
  },
  doSubmit: function(url){
    req.request('/app/work/add', {
      method: 'post',
      data: {
        courseLessonId: this.data.lessonInfo.id,
        url: url
      }
    }).then((res) => {
      this.setData({
        showLoading: false,
        submitWorkId: res.data.id
      })
    });
  },
  playTempAudio: function(){
    let that = this;
    tempAudioContext.stop();
    tempAudioContext.src =  that.data.tempFile.tempFilePath;
    tempAudioContext.onPlay(() => {
      console.log('开始播放')
    });
    tempAudioContext.play();
  },
  submitTempRecord: function(){
    tempAudioContext.stop();
    this.setData({
      isRecordFinish: false,
      duration: 0,
      durationTime: '00:00'
    })
    this.uploadFile();
  },
  closeVoiceLayer: function(){
    this.setData({
      isRecordFinish: false
    });
    tempAudioContext.stop();
  },
  //时间格式转换 秒 转为 00:00
  formatTime: function(time){
    let secondTime = parseInt(time);
    let minuteTime = 0;
    if(secondTime > 60){
      minuteTime = parseInt(secondTime/60);
      secondTime = parseInt(secondTime%60);
    }
    minuteTime = '0'+minuteTime;
    secondTime = secondTime<10?'0'+secondTime:secondTime;
    this.setData({
      durationTime: minuteTime+':'+secondTime
    })
  },
  perviewImg: function(e){
    let idx = e.currentTarget.dataset.index;
    let curUrl = this.data.lessonInfo.arrImages[idx];
    wx.previewImage({
      current: curUrl,
      urls: this.data.lessonInfo.arrImages
    })
  },
  audioInitialization:function(data){
    let that = this;
    this.data.innerAudioContext.src = data.voiceUrl;
    this.data.innerAudioContext.play();
    this.data.innerAudioContext.pause();
    this.data.innerAudioContext.onCanplay(()=>{
      that.data.innerAudioContext.duration
      setTimeout(function(){
        var duration = that.data.innerAudioContext.duration;
        var min = parseInt(duration/60);
        var sec = parseInt(duration%60);
        if(min.toString().length == 1){
          min = `0${min}`;
        }
        if(sec.toString().length == 1){
          sec = `0${sec}`;
        }
        that.setData({
          audioDuration: that.data.innerAudioContext.duration,
          showTime2: `${min}:${sec}`
        })
      },1000)
    })
  },
  sliderChange(e){
    var that = this;
    this.data.innerAudioContext.src = this.data.lessonInfo.voiceUrl;
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
    this.data.innerAudioContext.seek(value);
    this.data.innerAudioContext.play();
  },
  playAudio(){
    var isPlayAudio = this.data.isPlayAudio;
    var seek = this.data.audioSeek;
    this.data.innerAudioContext.pause();
    this.setData({
      isPlayAudio: !isPlayAudio
    })
    if(isPlayAudio){
      this.setData({
        audioSeek: this.data.innerAudioContext.currentTime
      })
    }else{
      this.data.innerAudioContext.src = this.data.lessonInfo.voiceUrl;
      if(this.data.innerAudioContext.duration != 0){
        this.setData({
          audioDuration: this.data.innerAudioContext.duration
        })
      }
      this.data.innerAudioContext.seek(seek);
      this.data.innerAudioContext.play();
    }
  },
  loadaudio(){
    var that = this;
    this.data.durationIntval = setInterval(function(){
      if(that.data.isPlayAudio==true){
        var seek = that.data.audioSeek;
        var duration = that.data.innerAudioContext.duration;
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
          that.data.innerAudioContext.stop();
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
    if(this.data.innerAudioContext){
      this.data.innerAudioContext.stop();
    }
    
    tempAudioContext.stop()
  },
  returnHome: function(){
    wx.switchTab({
      url: '../index/index'
    })
  },
  onShareAppMessage: function (res) {
    let that = this;
    let type = this.data.lessonInfo.workType;
    let path = '';
    if (type == 1) {
      path = '/pages/share_video/share_video?scene=' + this.data.submitWorkId;
    } else {
      path = '/pages/share_audio/share_audio?scene=' + this.data.submitWorkId;
    }
    return {
      title: '言之有道',
      path: path,//这里填写首页的地址,一般为/pages/xxxx/xxx
      success: function (res) {
        // 转发成功
        that.setData({
          showShareLayer: false
        });

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
  chooseShareType: function(){
    this.setData({
      showShareLayer: true
    })
  },
  closeShareLayer: function(){
    this.setData({
      showShareLayer: false
    })
  },
  //分享到朋友圈
  shareFriendCirlce: function(){
    wx.showLoading({
      title: '生成图片中...',
    });
    let that = this;
    req.request('app/work/shareImage', {
      method: 'post',
      data: {
        id: that.data.submitWorkId
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
  }
})
