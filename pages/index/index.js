const app = getApp();

Page({
  data: {
    motto: '42',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    cmdStartDisabled: true,
    cmdSummaryDisabled: true
  },
  //事件处理函
  ShowScore: function () { wx.reLaunch({ url: '/pages/contest/summary' }); },
  onShow: function () {
    //app.Login();
    let that = this;//查询是否可以开始考试
    //开始测试：summary中currentindex获取到值，查看得分：summary中finished=true
    //console.log(app.globalData.synchronized); console.log(this.data.cmdStartDisabled);
    if(app.globalData.openId.length == 0) return;
    wx.request({
      url: "https://page404.top:8000/Home/Summary", method: "POST",
      data: { openId: app.globalData.openId },
      success: summary => {
        console.log(summary);
        if (summary.data.success) {
          that.setData({ 'cmdStartDisabled': summary.data.currentIndex < 0  });
          that.setData({ 'cmdSummaryDisabled': summary.data.currentIndex >= 0});
        } else {
          that.resetView();
        }
      },
      fail: () => { that.resetView(); }
    });
  },
  resetView: function() {
    this.setData({ 'cmdStartDisabled': true });
    this.setData({ 'cmdSummaryDisabled': true });
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo, hasUserInfo: true });
      console.log("Load Type A");
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({ userInfo: res.userInfo, hasUserInfo: true });
        console.log("Load Type B");
        //app.Login();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({ userInfo: res.userInfo, hasUserInfo: true });
          console.log("Load Type C");
        }
      });
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({ userInfo: e.detail.userInfo, hasUserInfo: true });
    console.log("getUserInfo function");
    wx.login({
      success: res=>{
        app.Sync(res.code, e.detail.userInfo);
      }
    })
  },
  StartTest: function () {
    wx.reLaunch({ url: "/pages/contest/test" });
  }
})
