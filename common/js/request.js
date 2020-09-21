var app;

function requestNet(par) {
  if (!app)
    app = getApp();
  wx.getStorage({
    key: 'openId',
    success: function(res) {
      var openId = "";
      if (res.data && res.data.openId)
        openId = res.data.openId;
      startReq(par, openId);
    },
    fail: function() {
      startReq(par, "");
    }
  });
}

function startReq(par, openId) {
  var data = par.data || {};
  try {
    data.openId = openId;
  } catch (e) {}
  var opt = par.opt;
  if (opt && opt.loading === true) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
  }
  wx.request({
    url: app.globalData.url + par.url,
    data: data,
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      // 'applicationType': app.globalData.applicationType || ""
    },
    method: 'POST',
    success: function(res) {
      wx.hideLoading();
      if (res.statusCode != 200) {
        wx.showToast({
          title: "网络连接失败",
          icon: 'none',
          duration: 2000
        });
        return;
      }
      res = res.data;

      var success = par.success;
      var code = res.code;
      if (opt && opt.mustOK === false) {
        success && success(res);
        return;
      }
      if (code == 200) {
        success && success(res);
        return;
      }
      wx.showToast({
        title: res.msg || "提示",
        icon: 'none',
        duration: 2000
      });
    },
    fail: function() {
      wx.hideLoading();
      var fail = par.fail;
      if (fail) {
        fail && fail();
      } else {
        wx.showToast({
          title: "网络连接错误,请检查网络",
          icon: 'none',
          duration: 2000
        });
      }
    },
    complete: function() {

    }
  });
}
module.exports = {
  send: requestNet
}