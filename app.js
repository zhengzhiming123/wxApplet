//app.js
App({
  onLaunch: function () {
  },
  globalData: {
    //host: 'http://localhost:8080/yanzhiyoudao/',
    host: 'https://api.yanzhiyoudao.cn/yanzhiyoudao/',
    cos: {
      secretId: 'AKIDZx7icO3DG4bbOD9tX4LL5cy7E6j580GF',
      secretKey: '56q0uYx721xlIYXIp574lUyBI2VjsmQn',
      bucket: "yzyd-1259468534",
      region: "ap-shanghai",
    },
    userInfo: null, //登录用户信息
    wxInfo: null,
    signInDate: ""   //签到日期
  },
})