var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        currentPage: 1,
        requestData: null, //请求的数据
        allData: null, //第一次请求到的所有数据，用于恢复筛选数据
        openFilterModal: false, //打开筛选弹框
        baseUrl: '/api/goods/goodsList', //基地址
        requestUrl: '', //请求的链接
    },

    onLoad: function (options) {
        load.init(this, 'goods_list', 'requestData');
        var requestUrl = this.data.baseUrl + (typeof options.cat_id != 'undefined' ? '?id=' + options.cat_id : '');
        this.requestGoodsList(requestUrl);
    },

    changeTab: function (e) {
        this.resetData();
        this.requestGoodsList(e.currentTarget.dataset.href);
    },

    requestGoodsList: function (requestUrl) {
        var that = this;
        this.data.requestUrl = requestUrl;
        requestUrl += (requestUrl.indexOf('?') > 0 ? '&' : '?') + 'p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            if (that.data.allData == null) {
                that.data.allData = Object.assign({}, res.data.result);
            }
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestGoodsList(this.data.requestUrl);
        }
    },

    onPullDownRefresh: function () {
        this.resetData();
        this.requestGoodsList(this.data.requestUrl);
    },

    openFilterModal: function () {
        this.setData({ openFilterModal: true });
    },

    closeFilterModal: function () {
        this.setData({ openFilterModal: false });
    },

    /** 商品筛选 */
    filterGoods: function (e) {
        this.resetData();
        this.requestGoodsList(e.currentTarget.dataset.href);
        this.closeFilterModal();
    },

    /** 重置数据 */
    resetData: function () {
        load.resetConfig();
        this.data.requestData = null;
        this.data.currentPage = 1;
    },

    restoreData: function () {
        this.setData({ 'requestData': this.data.allData });
    }

});