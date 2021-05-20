//integral.js
//获取应用实例
const app = getApp()
const req = require("../../utils/request.js");

Page({
  data: {
    page: 1,
    totalPage: 1,
    serviceData: {
      date: '2019-07',
      page: 1,
      limit: 10
    },
    pointsList: [],
    totalIn: 0,
    totalOut: 0
  },
  onLoad: function () {
    this.getPointList();
  },
  bindDateChange: function(e){
    this.setData({
      ['serviceData.date']: e.detail.value,
      ['serviceData.page']: 1,
      pointsList: []
    });
    this.getPointList();
  },
  getPointList: function(){
    let that = this;
    req.request('/app/points/list', {
      method: 'post',
      data: this.data.serviceData
    }).then((res) => {
      console.log(res)
      that.setData({
        //totalpages: res.data.totalPage,
        pointsList: that.data.pointsList.concat(res.data),
        totalIn: res.in,
        totalOut: res.out || 0
      })
    });
  },
})
