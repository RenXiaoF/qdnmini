var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        categories: [
            { name: "全部", type: 'all' },
            { name: "增加", type: 'plus' },
            { name: "减少", type: 'minus' }
        ],
        activeType: 'all',
        accounts: null,
        currentPage: 1,
        isjz:1
    },

    onLoad: function (options) {
        var activetype = typeof options.type == 'undefined' ? this.data.activeType : options.type;
        var isjz = typeof options.isjz == 'undefined' ? this.data.isjz : options.isjz; 
        this.setData({isjz:isjz});
        load.init(this, '', 'accounts');
        this.requestAccountList(activetype,isjz);
    },

    changeTab: function (e) {
        //重置数据
        load.resetConfig();
        this.data.accounts = null;
        this.data.currentPage = 1;
        this.requestAccountList(e.currentTarget.id,this.data.isjz);
    },

    requestAccountList: function (activetype,isjz) {
        var that = this;
        var requestUrl = '/api/user/account_list'  + '?p=' + that.data.currentPage + '&isjz='+isjz+'&type='+activetype;
        console.log('requesturl');
        console.log(requestUrl);
        this.setData({ activeType: activetype });
        load.request(requestUrl, function (res) {
            console.log('resssss');
            console.log(res);
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.changeTimeFommat = util.format(val.change_time, 'yyyy-MM-dd hh:mm');
            });
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestAccountList(this.data.activeType,this.data.isjz);
        }
    },

    onPullDownRefresh: function (e) {
        this.data.accounts = null;
        this.data.currentPage = 1;
        load.resetConfig();
        this.requestAccountList(this.data.activeType,this.data.isjz);
    }

});