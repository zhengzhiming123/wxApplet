const app = getApp();
const cache = require('cache.js');
const util = require('util.js');

function request(url, options) {
  var that = this;
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.host + url,
      method: options.method,
      data: options.data,
      header: {
        'Content-Type': 'application/json; charset=UTF-8',
        'token': wx.getStorageSync('token'),
      },
      success(res) {
        if (res.statusCode == 200){
          if (res.data.code == 0) {
            resolve(res.data)
          } else if (res.data.code == 401) {
            cache.clear()
            showToast('您还未登录，请先登录！', function () {
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/login/login'
                })
              }, 1000)
            });
          } else {
            util.hideLoading();
            util.showToast(res.data.msg);
          }
        } else {
          util.hideLoading();
          showModal('提示', '请求超时，请稍后再试');
        }
      },
      fail(error) {
        reject(error.data)
      },
      complete(){
        
      }
    })
  })
}

function isLogin() {
  return wx.getStorageSync('token') ? true : false;
}

function showToast(content, success){
  wx.showToast({
    title: content,
    icon: 'none',
    success: function () {
      if(success) {
        success();
      }
    }
  });
}

function showModal(title, content){
  wx.showModal({
    title: title,
    content: content,
    showCancel: false
  });
}

module.exports = {
  request: request,
  isLogin: isLogin
}