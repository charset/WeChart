const host = "https://page404.top";
//const host = "http://localhost:64028";

App({
  Sync: function (code, userInfo) {
    wx.request({
      url: host + "/Home/Code/" + code, method: "POST", data: { userInfo: userInfo },
      success: sync => {
        if (sync.data.success) {
          this.globalData.openId = sync.data.openId;
          if (this.globalData.openId) {
            wx.setStorageSync('openId', this.globalData.openId); console.log("Got openId:" + sync.data.openId);
          }
          this.globalData.currentIndex = sync.data.currentID;
        }
      },
      fail: () => { console.log("Home/Code Fail"); }
    })
  },
  Login: function (callback = true) {
    console.log(callback);
    wx.login({
      success: res => {// 获取用户信息
        var code = res.code; console.log(code);
        wx.getSetting({
          success: res => {
            var that = this;
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  console.log(res);
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo;
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  
                  if (this.userInfoReadyCallback && callback) {
                    this.userInfoReadyCallback(res);
                  }
                  console.log("bypass callback");
                  this.Sync(code, res.userInfo);
                }
              });
            }
          }
        });
      }
    });//End of wxLogin
  },
  onLaunch: function () {
    this.globalData.openId = wx.getStorageSync('openId') || [];
    console.log("onlaunch : openId ="+this.globalData.openId);
    this.Login(true);
  },
  globalData: {
    userInfo: null,
    currentIndex: 0,
    openId: "小行星"
  }
})