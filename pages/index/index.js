const app = getApp();

Page({
  data: {
    motto: '《架构简明测试》',
    userInfo: {}, hasUserInfo: false, canIUse: wx.canIUse('button.open-type.getUserInfo'),
    cmdStartDisabled: true, cmdSummaryDisabled: true, cmdResetUserDisabled: true
  },
  //事件处理函
  ShowScore: function () { wx.reLaunch({ url: '/pages/contest/summary' }); },
  ResetUser: function () {
    wx.showModal({
      title: '重要提示', content: '点击投诉按钮将会清空你的成绩！',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: "https://page404.top/Home/Reset/",
            method: "POST", data: { openId: app.globalData.openId },
            success: deal => {
              if (deal.data.userInfoDeleted == 1) {
                wx.removeStorageSync('openId');
                wx.reLaunch({ url: '/pages/index/index' });
              } else {
                wx.showModal({
                  title: "ResetUnsuccessful", content: "似乎还没法提交呢..",
                  showCancel: false, confirmText: "好吧"
                });
              }
            },
            fail: () => {
              wx.showModal({
                title: "ResetFail", content: "似乎小好又开小差了.",
                showCancel: false, confirmText: '朕怎知道'
              });
            }
          });
        }
      }
    });//endof ShowModal
  },
  onShow: function () {
    let that = this;
    if (app.globalData.openId.length == 0) return;
    wx.request({
      url: "https://page404.top/Home/Summary", method: "POST",
      data: { openId: app.globalData.openId },
      success: summary => {
        console.log(summary);
        if (summary.data.success) {
          that.resetView(summary.data.currentIndex < 0, summary.data.currentIndex >= 0);
        } else {
          that.resetView();
        }
      },
      fail: () => { that.resetView(); }
    });
  },
  resetView: function (start = true, summary = true) {
    this.setData({ 'cmdStartDisabled': start });
    this.setData({ 'cmdSummaryDisabled': summary });
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo, hasUserInfo: true }); console.log("Load Type A");
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({ userInfo: res.userInfo, hasUserInfo: true }); console.log("Load Type B");
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({ userInfo: res.userInfo, hasUserInfo: true }); console.log("Load Type C");
        }
      });
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({ userInfo: e.detail.userInfo, hasUserInfo: true });
    wx.login({
      success: res => {
        app.Sync(res.code, e.detail.userInfo);
      }
    })
  },
  StartTest: function () {
    wx.reLaunch({ url: "/pages/contest/test" });
  }
})
