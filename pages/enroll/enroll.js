//index.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");
const util = require("../../utils/util.js");

Page({
  data: {
    studentName: '',
    certIndex: 0,
    certificatesData: ['身份证', '驾照'],
    birthday: '',
    uploadPhoto: '',
    IDCard: '',
    school: '',
    address: '',
    levelData: [1,2,3],
    levelIndex: 0,
    organization:'',
    orgAddress: '',
    exam: '',
    showCountDown: false,
    countDownSecond: 60,
    mobile: '',
    code: '',
    showPayResult: false
  },
  onLoad: function () {
  },
  studentNameInput (e){
    this.data.studentName = e.detail.value;
  },
  genderChange () {

  },
  bindCertPickerChange (e) {
    this.setData({
      certIndex: e.detail.value
    })
  },
  IDCardChange (e) {
    this.data.IDCard = e.detail.value;
  },
  bindBirthdayChange (e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  schoolChange(e){
    this.data.school = e.detail.value;
  },
  addressChange(e){
    this.data.address = e.detail.value;
  },
  bindLevelPickerChange (e) {
    this.setData({
      levelIndex: e.detail.value
    })
  },
  orgChange (e){
    this.data.organization = e.detail.value;
  },
  orgAddressChange(e){
    this.data.orgAddress = e.detail.value;
  },
  examChange(e){
    this.data.exam = e.detail.value;
  },
  mobileInput (e) {
    this.data.mobile = e.detail.value;
  },
  codeInput: function(e) {
    this.data.code = e.detail.value;
  },
  //获取验证码
  getCode () {
    let that = this;
    if (!util.isMobile(this.data.mobile)) {
      util.showToast('手机号错误');
      return false;
    }

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
  },
  choosePhoto () {
    const that = this;
    wx.chooseImage({
      count: 1,
      success: function(res){
        console.log(res)
        if (res.tempFilePaths.count == 0) {
          return;
        }
        that.setData({
          uploadPhoto: res.tempFilePaths
        })
      }
    })
  },
  deleteImvPhoto () {
    this.setData({
      uploadPhoto: ''
    })
  },
  doSubmit () {
    this.setData({
      showPayResult: true
    })
  }
})
