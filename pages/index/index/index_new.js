// 获取实例应用
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require('../../../utils/util.js');
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js';
var load = new LoadMore

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    logo: setting.appLogo,
    dataList: null, // 首页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.setNavigationBarTitle({
      titile: setting.appName,
    });
    
    this.requestGetMagic();
  },
  /**魔法首页 */
  requestGetMagic: function () {
    var that = this;
    // var num = 1;
    var requestUrl = '/api/index/ajaxGetMagicMore';
    request.get(requestUrl, {
      sussess: function (res) {
        console.log(首页)
        console.log(res.data.data);
        that.setData({ dataList: res.data.result.data });
      }
    })
  },

  /**下拉触底 */
  // onReachBottom: function(){
  //   if (load.canloadMore()) {

  //   }
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})