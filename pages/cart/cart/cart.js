var app = getApp();
var request = app.request;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        carts: null,           // 购物车商品列表
        checkAllToggle: false, // 是否全选标志
    },
    
    /** 返回的时候刷新 */
    onShow: function () {
        this.getCardList();
    },

    /** 删除一商品 */
    deleteItem:function (e) {
        var that = this;
        wx.showModal({
            title: '确定删除',
            success: function (res) {
                if (!res.confirm) {
                    return;
                }
                var sidx = e.currentTarget.dataset.sidx;
                var cart = that.data.carts[sidx];
                var cart_id = [];
                cart_id.push(cart.id);

                var postData = JSON.stringify({'ids':cart_id});

                request.post('/api/cart/wechat_delCart', {
                    data: {cart_form_data: postData},
                    success: function (res) {
                        that.doCheckAll(res.data.data);
                    }
                });
            }
        })
    },

    /** 输入购买数量 */
    valueToNum:function (e) {

        var sidx = e.currentTarget.dataset.sidx;
        var cart = this.data.carts[sidx];
        var cart_select = {};
        cart_select[cart['id']] = cart.selected;
        var goods_num = {};
        var num = (e.detail.value <= 1) ? 1 : (e.detail.value);
        goods_num[cart['id']] = num;

        var postData = JSON.stringify({'cart_select':cart_select, 'goods_num': goods_num});
        this.postCardList(postData);
    },

    /** 数量加1 */
    addNum:function (e) {

        var sidx = e.currentTarget.dataset.sidx;
        var cart = this.data.carts[sidx];
        var cart_select = {};
        cart_select[cart['id']] = cart.selected;
        var goods_num = {};
        var num = 1 + cart.goods_num;
        goods_num[cart['id']] = num;

        var postData = JSON.stringify({'cart_select':cart_select, 'goods_num': goods_num});
        this.postCardList(postData);
    },

    /** 数量减1 */
    subNum:function (e) {

        var sidx = e.currentTarget.dataset.sidx;
        var cart = this.data.carts[sidx];
        var cart_select = {};
        cart_select[cart['id']] = cart.selected;
        var goods_num = {};
        var num = (cart.goods_num <= 1) ? 1 : (cart.goods_num - 1);
        goods_num[cart['id']] = num;

        var postData = JSON.stringify({'cart_select':cart_select, 'goods_num': goods_num});
        this.postCardList(postData);
    },

    /** 选择所有商品 */
    selectAll:function(){
        this.data.checkAllToggle = !this.data.checkAllToggle;
        var carts = this.data.carts;
        var carts_num = carts.length;
        var cart_select = {};
        var goods_num = {};
        for (var i = 0; i < carts_num; i++) {
            cart_select[carts[i].id] = this.data.checkAllToggle;
            goods_num[carts[i].id] = carts[i].goods_num;
        }
        var postData = JSON.stringify({'cart_select':cart_select, 'goods_num': goods_num});
        this.postCardList(postData);
    },

    /** 选择单一商品 */
    selectGoods: function (e) {
        var sidx = e.currentTarget.dataset.sidx;
        var cart = this.data.carts[sidx];
        var cart_select = {};
        cart_select[cart['id']] = cart.selected ? 0 : 1;
        var goods_num = {};
        goods_num[cart['id']] = cart.goods_num;

        var postData = JSON.stringify({'cart_select':cart_select, 'goods_num': goods_num});
        this.postCardList(postData);
    },

    /** 选择一店铺下所有商品 */
    selectStore: function (e) {
        var sidx = e.currentTarget.dataset.sidx;
        var store = this.data.carts.storeList[sidx];
        var postData = [];
        for (var i = 0; i < store.cartList.length; i++) {
            postData.push({
                goodsNum: store.cartList[i].goods_num,
                selected: Number(!store.selected),
                cartID: store.cartList[i].id,
            });
        }
        this.postCardList(JSON.stringify(postData));
    },

    /** 对获取的数据进行选择检查 */
    doCheckAll: function (data) {
        // var storeList = data.
        // if (!storeList || !storeList.length) {
        //     this.setData({
        //         carts: null,
        //         checkAllToggle: false
        //     });
        //     return;
        // }
        // var checkAllToggle = true;
        // for (var i = 0; i < storeList.length; i++) {
        //     storeList[i].selected = true;
        //     for (var j = 0; j < storeList[i].cartList.length; j++) {
        //         if (!storeList[i].cartList[j].selected) {
        //             storeList[i].selected = false;
        //             checkAllToggle = false;
        //             break;
        //         }
        //     };
        // }

        // 是否显示全选，所有选中（全选），没有选中（取消全选）
        // 显示统计总价格
        var is_checked = true;
        var total_price = 0;
        this.data.carts = data;
        for(var ind=0;ind<data.length;ind++) {
            if (!(data[ind].selected)) {
                is_checked = false;
            } else {
                total_price += data[ind].member_goods_price * data[ind].goods_num * 100;
            }
        }
        this.data.checkAllToggle = is_checked;

        this.setData({ 
            carts: data,
            checkAllToggle: this.data.checkAllToggle,
            total_price: total_price/100
        });
    },

    /** 提交购物车数据 */
    postCardList: function (postData) {
        var that = this;
        request.post('/api/cart/wechat_operateCart', {
            data: { cart_form_data: postData },
            success: function (res) {
                that.doCheckAll(res.data.data);
            }
        });
    },

    /** 获取购物车列表 */
    getCardList: function () {
        var that = this;
        request.get('/api/cart/wechat_cartList', {
            success: function (res) {
                that.doCheckAll(res.data.result);
                wx.stopPullDownRefresh();
            }
        });
    },

    onPullDownRefresh: function (e) {
        this.getCardList();
    },

    /** 去结算 */
    checkout: function () {
        var hasAnySelected = false;
        var carts = this.data.carts;
        for (var i = 0; i < carts.length; i++) {
            if (carts[i].selected) {
                hasAnySelected = true;
                break;
            }
        }
        if (!hasAnySelected) {
            app.showWarning('还没有选中商品');
            return;
        }
        wx.navigateTo({ url: '/pages/cart/cart2/cart2' });
    }

});