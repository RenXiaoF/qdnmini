//获取应用实例
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require('../../../utils/util.js');
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js';
var load = new LoadMore;

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        logo: setting.appLogo,
        homeData: null, //首页轮播和广告
        saleGoods: null,  //秒杀商品
        magicList: null, //魔法首页
        immediatelyCoupon: null, //立刻领券
        sale: {
            countTime: {
                hour: '00',
                minute: '00',
                second: '00',
            },
            diffTime: 0,
            good: null,
        },
        timer: null, //活动倒计时定时器
        recommend: null, //推荐商品
        scrollTop: 0, // 滚动
        currentPage: 1,
        isDisplay: true, // 立刻领券top
        supportPageScroll: false, //微信版本是否支持页面滚动回顶部
        homePage: 1, // 请求的页数
    },

    //事件处理函数
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: setting.appName,
        });
        //以前有登录过，则直接登录
        if (app.auth.hadAuth()) {
            app.getUserInfo();
        }
        load.init(this, '', 'recommend');

        // 立刻领券
        this.getCoupon();
        //魔法首页
        this.requestGetMagic();
        // 是否支持滚动
        if (wx.pageScrollTo) {
            this.setData({ supportPageScroll: true });
        }
    },

    //魔法首页
    requestGetMagic: function () {
        var that = this;
        var requestUrl = '/api/index/ajaxGetMagicMore?page=' + that.data.homePage;
        request.get(requestUrl, {
            success: function (res) {
                console.log("首页请求数据", res.data.result.data);
                console.log('首页请求的页数', res.data.result.page);
                let tempData = that.data.magicList;
                if (that.data.homePage === 1) {
                    tempData = res.data.result.data;
                } else {
                    // tempData = that.data.magicList;
                    for (let item of res.data.result.data) {
                        tempData.push(item);
                    }
                }
                console.log(tempData);
                that.setData({
                    magicList: tempData,
                    homePage: res.data.result.page,
                });
            },
            error: function (res) {
                console.log("123");
            },
        });
    },
    /**立刻领券 */
    getCoupon: function () {
        var that = this;
        var requestUrl = '/api/index/getConfigure';
        request.get(requestUrl, {
            success: function (res) {
                console.log("立刻领券")
                console.log(res.data.result);
                that.setData({ immediatelyCoupon: res.data.result });
            }
        });
    },
    // 下拉触底-触底自动调用此方法
    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestRecommend();
        }
    },
    // 请求推荐
    requestRecommend: function () {
        var that = this;
        // var requestUrl = '/api/index/recommend?p=' + that.data.currentPage;
        // load.request(requestUrl, function () {
        //     that.data.currentPage++;
        // });
        this.requestGetMagic();
    },
    // 请求主页面
    requestHomePage: function () {
        var that = this;
        request.get('/api/index/homePage?new_ad=1', {
            success: function (res) {
                var banners = res.data.result.banner;
                for (var i = 0; i < banners.length; i++) {
                    banners[i].ad_code = common.getFullUrl(banners[i].ad_code);
                    if (banners[i].media_type == 3) {
                        banners[i].media_link = '/pages/goods/goodsInfo/goodsInfo?goods_id=' + banners[i].ad_link;
                    } else if (banners[i].media_type == 4) {
                        banners[i].media_link = '/pages/goods/goodsList/goodsList?cat_id=' + banners[i].ad_link;
                    }
                }
                var sale_goods = res.data.result.flash_sale_goods;
                if (sale_goods.length > 0) {
                    that.setSaleTime(res.data.result);
                }
                if (sale_goods.length > 0 && sale_goods.length < 3) {
                    that.setData({ saleGoods: sale_goods });
                } else if (sale_goods.length >= 3) {
                    var goods;
                    for (var j = 0; j <= 3; j++) {
                        goods[j] = sale_goods[j];
                    }
                    that.setData({ saleGoods: goods });
                }
                that.setData({ homeData: res.data.result });
                wx.stopPullDownRefresh();
            }
        });
    },
    // 下拉刷新
    onPullDownRefresh: function (e) {
        this.data.recommend = null;
        this.data.currentPage = 1;
        load.resetConfig();
        //this.requestHomePage();//首页数据
        this.requestRecommend(); // 请求推荐
        this.requestGetMagic(); //魔法首页
    },
    // 离开页面
    onUnload: function () {
        this.destroyActivityTimer(); //销毁活动倒计时定时器
    },
    // 设置存活时间
    setSaleTime: function (result) {
        if (!result.diffTime) {
            result.diffTime = (new Date()).getTime() - result.server_time * 1000;
        }
        this.setData({ 'sale.diffTime': result.diffTime });
        this.setData({ 'sale.good': result.flash_sale_goods[0] });
        this.destroyActivityTimer(); //销毁活动倒计时定时器
        this.createActivityTimer(); //创建活动倒计时定时器
    },

    /** 创建活动倒计时定时器 */
    createActivityTimer: function () {
        var sale = this.data.sale;
        var that = this;
        this.data.timer = setInterval(function () {
            var time = sale.good.end_time * 1000 - (new Date()).getTime() + sale.diffTime;
            var remainTime = util.transTime(time);
            if (time <= 0) {
                // that.destroyActivityTimer();
                that.requestHomePage();//首页数据
                return;
            }
            that.setData({ 'sale.countTime': remainTime });
        }, 1000);
    },

    /** 销毁活动倒计时定时器 */
    destroyActivityTimer: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.data.timer = null;
        }
    },

    /** 页面滚动事件 */
    onPageScroll: function (e) {
        this.setData({ scrollTop: e.scrollTop });
        //可能还在滚动就跳到其他页面去了，导致导航栏变色，所以要判断路由
        var pages = getCurrentPages();
        if (pages[pages.length - 1].route == 'pages/index/index/index') {
            if (e.scrollTop > 10) {
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: '#f95959'
                });
            } else {
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: '#eeeeee'
                });
            }
        }
    },


    /**搜索框跳转 */
    jumpSearch: function () {
        wx.navigateTo({ url: '/pages/goods/search/search' });
    },

    /**搜索框后面 icon跳转 */
    jumpIcon: function () {
        wx.navigateTo({ url: 'pages/user/index/index' });
    },

    /**
     * 转发按钮
     */
    onShareAppMessage: function (res) {
        return setting.share;
    },

    /**
     *拨打客服电话
     */
    call: function () {
        var that = this;
        console.log(app.globalData);
        wx.showModal({
            title: '提示',
            content: '是否拨打客服电话?',
            success: function (res) {
                if (res.confirm) {
                    wx.makePhoneCall({
                        phoneNumber: app.globalData.userInfo.phone,
                    })
                } else if (res.cancel) {
                    console.log('no');
                }
            }
        })
    },

    /**立刻领券top */
    onShowCoupon: function () {
        var that = this;
        that.setData({
            isDisplay: false
        })
    },

    /**返回顶部 */
    doScrollTop: function () {
        wx.pageScrollTo({ scrollTop: 0 });
    },

});
