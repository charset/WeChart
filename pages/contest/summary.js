Page({
  data:{
    frameHall:[]
  },
  onShow: function (loadEvent) {
    //判断题目是不是都做完了
    this.ShowSummary();
  }, 
  MainPage: function () {
    wx.reLaunch({ url: "/pages/index/index" });
  },
  ShowSummary: function () {
    let that = this; let app = getApp();
    wx.request({
      url: "https://page404.top:8000/Home/Summary/",
      method: "POST",
      data: { openId: app.globalData.openId },
      success: succ => {
        console.log(succ.data);
        var UI = {};
        if (succ.data.success) {
          var rt = succ.data.summary.right, tt = succ.data.summary.total;
          if (rt == 0 && tt == 0) { tt = 100; }
          that.setData({ 'right': rt });
          that.setData({ 'total': tt });
          
          that.setData({'frameHall' : succ.data.topUsers});
        } else {
          that.setData({ 'total': 0 });
        }
      },
      fail : ()=>{
        that.setData({ 'total': 0 });
      }
    })
  },
  data: {
    canShowSummary: false,
    right: 0,
    total: 100
  }
})