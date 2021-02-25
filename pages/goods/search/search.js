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
        openCheckModal: false, //打开综合弹框
        openFilterModal: false, //打开筛选弹框
        openSearchModal: false, //打开搜索界面
        // baseUrl: '/api/goods/search', // 原接口地址
        baseUrl: '/api/Goods/wechat_searchGoods', // 新接口地址
        requestUrl: '', //请求的链接
        hotWords: [['手机', '小裤', '新品'], ['背背佳', '休闲', '保暖']], //搜索热词
        order: 'goods_id',  // 商品排序的字段
        sort: 'desc',       // 商品排序字段的值
        check_order: '综合', // 商品综合的排序字段
    },
    
    onLoad: function (options) {
        load.init(this, 'data', 'requestData');
        var param = '?';
        if (typeof options.brand_ids != 'undefined') {
            param += 'brand_ids='+options.brand_ids+'&';
        }
        if (typeof options.store_ids != 'undefined') {
            param += 'store_ids='+options.store_ids+'&';
        }
        if (typeof options.category_id != 'undefined') {
            param += 'category_id='+options.category_id+'&';
        }
        if (typeof options.goods_ids != 'undefined') {
            param += 'goods_ids='+options.goods_ids+'&';
        }
        if (typeof options.prom_type != 'undefined') {
            param += 'prom_type='+options.prom_type+'&';
        }
        if (typeof options.prom_id != 'undefined') {
            param += 'prom_id='+options.prom_id+'&';
        }
        param = param == "?" ? '' : param.substring(0,param.length-1);

        return this.requestSearch(this.data.baseUrl + param);

        this.openSearchModal();
        this.setData({ order: this.data.order });
        this.setData({ sort: this.data.sort });
        this.setData({ check_order: this.data.check_order });
    },
    /**改变标签 */
    changeTab: function (e) {
        this.resetData();
        var order = e.currentTarget.dataset.id;
        var sort = e.currentTarget.dataset.sort;
        this.requestSearch(this.data.baseUrl +'?order=' + order+'&sort='+sort);
        this.data.sort = (sort == 'desc') ? 'asc' : 'desc';
        this.setData({ order: order });
        this.setData({ sort: this.data.sort });
    },
    /**请求搜索 */
    requestSearch: function (requestUrl) {
        var that = this;
        this.data.requestUrl = requestUrl; //保存链接
        requestUrl += (requestUrl.indexOf('?') > 0 ? '&' : '?') + 'page=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            if (that.data.allData == null) {
                that.data.allData = Object.assign({}, res.data.result);
            }
            that.closeSearchModal();
        });
    },
    /**上拉触底 */
    onReachBottom: function () {
        if (this.data.openSearchModal) {
            return;
        }
        if (load.canloadMore()) {
            this.requestSearch(this.data.requestUrl);
        }
    },
    /**打开综合弹框 */
    openCheckModal: function () {
        this.setData({ openCheckModal: true });
        this.setData({ check_order: this.data.check_order });
    },
    /**关闭综合弹框 */
    closeCheckModal: function () {
        this.setData({ openCheckModal: false });
    },
    changeCheckTab: function (e) {
        this.resetData();
        var order = e.currentTarget.dataset.id;
        var order_name = e.currentTarget.dataset.name;
        this.data.check_order = order_name;
        this.requestSearch(this.data.baseUrl +'?order=' + order+'&sort=desc');
        this.setData({ check_order: order_name });
        this.setData({ sort: this.data.sort });
        this.closeCheckModal();
    },
    /**打开过滤模式 */
    openFilterModal: function () {
        this.setData({ openFilterModal: true });
    },
    /**关闭过滤模式 */
    closeFilterModal: function () {
        this.setData({ openFilterModal: false });
    },

    /** 商品筛选 */
    filterGoods: function (e) {
        this.resetData();
        this.requestSearch(e.currentTarget.dataset.href);
        this.closeFilterModal();
    },

    /** 重置数据 */
    resetData: function () {
        load.resetConfig();
        this.data.requestData = null;
        this.data.currentPage = 1;
    },

    /** 恢复数据 */
    restoreData: function () {
        this.setData({ 'requestData': this.data.allData });
    },
    /**打开搜索模式 */
    openSearchModal: function () {
        this.setData({ openSearchModal: true });
    },
    /**关闭搜索模式 */
    closeSearchModal: function () {
        this.setData({ openSearchModal: false });
    },

    /** 提交搜索事件 */
    submitSearch: function (e) {
        this.search(e.detail.value.word);
    },

    /** 点击搜索热词事件 */
    searchHotWord: function (e) {
        this.search(e.currentTarget.dataset.word);
    }, 

    /** 对搜索词进行搜索 */
    search: function (word) {
        this.resetData();
        this.requestSearch(this.data.baseUrl + '?keyword=' + word);
    }

});