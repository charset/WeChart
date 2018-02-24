const host = "https://page404.top";
//const host = "http://localhost:64028";

const app = getApp();

Page({
  data: {
    ContestItem: {
      branchId: -1,
      content: "[题干位置]",
      isRichText: false,
      branchCount: 4,
      radioClass: 'show',
      checkboxClass: 'hide',
      answerClass: 'hide',
      testType: 0,
      contentAnswer: ''
    },
    radioItems: [
      { name: "A", value: "选项 A", checked: false }, { name: "B", value: "选项 B", checked: false },
      { name: "C", value: "选项 C", checked: false }, { name: "D", value: "选项 D", checked: false }
    ],
    checkboxItems: [
      { name: "A", value: "选项 A", checked: false }, { name: "B", value: "选项 B", checked: false },
      { name: "C", value: "选项 C", checked: false }, { name: "D", value: "选项 D", checked: false }
    ]
  },
  Next: function (e) {
    switch (this.data.testType) {
      case "0"://单选题
        for (var i = 0; i < this.data.ContestItem.branchCount; i++) {
          if (this.data.radioItems[i].checked) {
            this.Submit(i);
            return;
          }
        }
        wx.showToast({ title: '什么都没选...', icon: 'loading', duration: 500 });
        break;
      case "1"://多选题
        var selected = 0;
        for (var i = 0; i < this.data.ContestItem.branchCount; i++) {
          if (this.data.checkboxItems[i].checked) selected += (1 << i);
          console.log(selected);
        }
        console.log("SELECTED: " + selected);
        if (selected > 0) {
          this.Submit(selected);
          return;
        }
        wx.showToast({ title: '什么都没选...', icon: 'loading', duration: 500 });
        break;
    }
  },
  Previous: function (e) {
    let app = getApp();
    if (app.globalData.currentIndex == 0) return;
    app.globalData.currentIndex--;
    this.showTestPage();
  },
  Submit: function (choice) {
    let THAT = this; console.log(THAT);
    wx.getLocation({
      type: "wgs84",
      success: loc => {
        let p = THAT; console.log(p);
        wx.request({
          url: "https://page404.top/Contest/Submit/" + app.globalData.currentIndex, method: "POST",
          data: { OpenID: app.globalData.openId, Latitude: loc.latitude, Longitude: loc.longitude, Choice: choice },
          success: el => {
            var res = el.data; console.log(el); let Q = p;
            if (res.noMore) {
              wx.showModal({
                title: '提示',
                content: '提交本次测试并查看结果?',
                success: function (res) {
                  if (res.confirm) {
                    wx.request({
                      url: host + "/Contest/Deal/",
                      method: "POST", data: { openId: app.globalData.openId },
                      success: deal => {
                        if (deal.data == 1)
                          wx.reLaunch({ url: '/pages/contest/summary' });
                        else {
                          wx.showModal({
                            title: "DealUnsuccessful", content: "似乎还没法提交呢..",
                            showCancel: false, confirmText: "好吧"
                          });
                        }
                      },
                      fail: () => {
                        wx.showModal({
                          title: "DealFail", content: "似乎小好又开小差了.",
                          showCancel: false, confirmText: '朕怎知道'
                        });
                      }
                    });
                  }
                }
              });//endof ShowModal

            } else {
              if (res.rowsAffected >= 0) {
                app.globalData.currentIndex++; Q.showTestPage();
              } else {
                wx.showModal({
                  title: "上传选择答案错误", content: "似乎小好又开小差了.",
                  showCancel: false, confirmText: '朕怎知道'
                });
              }
            }
          },//endof getlocation.success.request.success
          fail: function () {
            wx.showModal({
              title: "连接错误", showCancel: false, confirmText: "朕知道了",
              content: "似乎无法连接到服务器. 你可以:查看你的网路设置/联系作者是否欠费."
            });
          }
        });//endof getlocation.success.request
      },//endof getlocation.success
      fail: () => {
        wx.reLaunch("/pages/index/index");
      }
    });
  },
  BindChangeRadio: function (e) {
    var index = e.detail.value.charCodeAt() - 'A'.charCodeAt(), changeUI = {};
    for (var i = 0; i < this.data.ContestItem.branchCount; i++) {
      changeUI['radioItems[' + i + '].checked'] = (i == index);
    }
    this.setData(changeUI);
  },
  BindChangeCheckbox: function (e) {
    var UI = {}, status = [0, 1, 2, 3], now = e.detail.value;
    console.log(now);
    for (var i = 0; i < e.detail.value.length; i++) {
      now[i] = e.detail.value[i].charCodeAt() - 'A'.charCodeAt();
      UI['checkboxItems[' + now[i] + '].checked'] = true;
    }
    console.log(now);
    var remain = status.filter(el => !now.includes(el));
    for (var i = 0; i < remain.length; i++) {
      UI['checkboxItems[' + remain[i] + '].checked'] = false;
    }
    console.log(remain);
    console.log(UI);
    this.setData(UI);
  },
  showTestPage: function () {
    var that = this;
    if (app.globalData.openId == null) return;
    console.log("Enter showTestPage request");
    wx.request({
      url: "https://page404.top/Contest/Test/" + app.globalData.currentIndex,
      method: "POST", data: { openId: app.globalData.openId },
      success: function (g) {
        var res = g.data, UI = {};
        console.log(g);
        if (res == null) return;
        that.setData({ 'ContestItem.content': res.content });
        that.setData({ 'ContestItem.branchId': res.branchID });
        that.setData({ 'testType': res.testType });
        switch (res.testType) {
          case '0':
            that.setData({ 'radioItems[0].value': 'A: ' + res.a });
            that.setData({ 'radioItems[1].value': 'B: ' + res.b });
            that.setData({ 'radioItems[2].value': 'C: ' + res.c });
            that.setData({ 'radioItems[3].value': 'D: ' + res.d });
            that.ensureView(true, false, false);
            if (res.chosen == null) {
              that.ResetCurrent(true, false, false);
            } else {
              UI['radioItems[' + res.chosen + '].checked'] = true;
              that.setData(UI);
            }
            break;
          case '1':
            that.setData({ 'checkboxItems[0].value': 'A: ' + res.a });
            that.setData({ 'checkboxItems[1].value': 'B: ' + res.b });
            that.setData({ 'checkboxItems[2].value': 'C: ' + res.c });
            that.setData({ 'checkboxItems[3].value': 'D: ' + res.d });
            that.ensureView(false, true, false);
            if (res.chosen == null) {
              that.ResetCurrent(false, true, false);
            } else {
              var array = [
                res.chosen & 0x01,
                (res.chosen & 0x02) >> 1,
                (res.chosen & 0x04) >> 2,
                (res.chosen & 0x08) >> 3
              ]
              for (var i = 0; i < array.length; i++) {
                if (array[i] > 0)
                  UI['checkboxItems[' + i + '].checked'] = true;
                that.setData(UI);
              }
            }
            break;
        }
      },
      fail: function (g) {
        that.setData({ 'ContestItem.content': "似乎无法找到题目" });
      }
    })
  },
  ResetCurrent: function (radio, checkbox, textbox) {
    var count = 0, UI = {};
    if (radio) count++; if (checkbox) count++; if (textbox) count++;
    if (count != 1) {
      radio = true; checkbox = false; textbox = false;
    }
    if (radio) {
      UI['radioItems[0].checked'] = false;
      UI['radioItems[1].checked'] = false;
      UI['radioItems[2].checked'] = false;
      UI['radioItems[3].checked'] = false;
    }
    if (checkbox) {
      UI['checkboxItems[0].checked'] = false;
      UI['checkboxItems[1].checked'] = false;
      UI['checkboxItems[2].checked'] = false;
      UI['checkboxItems[3].checked'] = false;
    }
    if (textbox) {
      UI['contentAnswer'] = '';
    }
    this.setData(UI);
  },
  ensureView: function (radio, checkbox, textbox) {
    var count = 0, UI = {};
    if (radio) count++; if (checkbox) count++; if (textbox) count++;
    if (count != 1) {
      radio = true; checkbox = false; textbox = false;
    }
    UI["ContestItem.radioClass"] = radio ? "show" : "hide";
    UI["ContestItem.checkboxClass"] = checkbox ? "show" : "hide";
    UI["ContestItem.textboxClass"] = textbox ? "show" : "hide";
    this.setData(UI);
  },
  onShow: function (e) {
    this.showTestPage();
  }
})