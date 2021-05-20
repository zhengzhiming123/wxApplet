
const req = require("../../utils/request.js");
const util = require("../../utils/util.js");
const cache = require("../../utils/cache.js");

Page({
  data: {
    mobile: '',
    code: '',
    openId: '',
    showCountDown: false,
    countDownSecond: 60,
  },
  onLoad: function () {
    this.wxLogin();
  },
  onShow: function() {
    if (!util.isBlank(cache.getToken())) {
      this.gotoIndex();
    }
  },
  mobileInput: function(e){
    this.data.mobile = e.detail.value;
  },
  codeInput: function(e) {
    this.data.code = e.detail.value;
  },
  wxLogin: function() {
    let that = this;
    wx.login({
      success: function (res) {
        that.getOpenId(res.code);
      }
    });
  },
  getOpenId: function(code) {
    req.request('/app/getOpenId', {
      method: 'post',
      data: {
        code: code
      }
    }).then((res) => {
      if (res.code == 0) {
        this.data.openId = res.data.openId
      }
    });
  },
  getCode: function(e) {
    let that = this;
    if (!util.isMobile(this.data.mobile)) {
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
    req.request('/app/loginCode', {
      method: 'post',
      data: {
        mobile: this.data.mobile,
        code: code
      }
    }).then((res) => {
      util.hideLoading();
      util.showToast('发送成功');
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
  login: function() {
    if (!util.isMobile(this.data.mobile)) {
      util.showToast('手机号错误');
      return false;
    }
    if (util.isBlank(this.data.code)) {
      util.showToast('请输入验证码');
      return false;
    }
    let postData = {
      mobile: this.data.mobile,
      code: this.data.code,
      openId: this.data.openId,
    }
    util.showLoading('登录中...');
    req.request('/app/login', {
      method: 'post',
      data: postData
    }).then((res) => {
      util.hideLoading();
      if (!util.isBlank(res.token)) {
        cache.setToken(res.token)
        this.gotoIndex();
      } else {
        util.showToast('登录失败');
      }
    });
  },
  gotoIndex: function() {
    wx.switchTab({
      url: '../index/index'
    })
  }
})
