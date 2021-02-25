var app = getApp();
var request = app.request;

Page({
    data: {
        url: app.globalData.setting.url,
        firstCategoris: [], // 请求的全部数据
        categories: [], // 根据不同的id，承接的分组数据
        ad: null, //广告
        currentIndex: 0, //目前的第一分类id
        // scrollHeight: 0, //界面高度，用于滚动
        scrollTop:0, // 右侧内容的滚动条到顶部的距离

    },
    Cates:[], //接口返回数据

    onLoad: function () {
        this.requestFirstCategoris();
    },
    // 一级分类
    requestFirstCategoris: function () {
        var that = this;
        request.post('/api/Goods/wechat_categoryList', {
            success: function (res) {

                that.Cates = res.data.result;
                // 构造左侧大菜单数据
                let firstCategoris = that.Cates.map(v => v.mobile_name);
                // 构造右侧商品数据
                let categories = that.Cates[0].wechat_child_category;
                that.setData({
                    firstCategoris,
                    categories,
                })
            }
        });
    },

    // 左侧菜单的点击事件
    requestCategories: function (e) {
        var that = this;
        const {index} = e.currentTarget.dataset;
        let categories = that.Cates[index].wechat_child_category;
        that.setData({
            currentIndex:index,
            categories,
            // 重新设置 右侧内容的scroll-view标签到顶部的距离
            scrollTop: 0
        })
    },


    goodsList: function (e) {
        var catId = e.currentTarget.dataset.id;
        wx.navigateTo({ url: '/pages/goods/search/search?category_id=' + catId, })
    },

    jumpSearch: function () {
        wx.navigateTo({ url: "/pages/goods/search/search" });
    },

})