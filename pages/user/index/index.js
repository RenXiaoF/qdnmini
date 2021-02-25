var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        defaultAvatar: setting.resourceUrl + "/static/images/user68.jpg",
        userInfo: {
            collect_count: 0,
            message_count: 0,
            waitPay: 0,
            waitSend: 0,
            waitReceive: 0,
            uncomment_count: 0,
            return_count: 0,
            user_money: 0,
            coupon_count: 0,
            pay_points: 0,
            phone:''
        },
        userInfoList:{
            manageList:[
                {
                  pic: '../../../images/qdn/crown.png',
                  des: '积分抽大奖',
                  url: '/pages/goods/integralDraw/integralDraw'
                },
                {
                  pic: '../../../images/w6.png',
                  des: '客户申请',
                  url: '/pages/user/apply_list/apply_list'
                },
                {
                  pic: '../../../images/w7.png',
                  des: '领券中心',
                  url: '/pages/activity/coupon_list/coupon_list'
                },
                // {
                //   pic: '../../../images/w5.png',
                //   des: '卖家App',
                //   url: '/pages/user/sellerapp/sellerapp'
                // },
                // {
                //   pic: '../../../images/w2.png',
                //   des: '我的评价',
                //   url: '/pages/user/comment/comment?status=1'
                // }, 
                {
                  pic: '../../../images/w3.png',
                  des: '浏览记录',
                  url: '/pages/user/visit_log/visit_log'
                },
                {
                id: 'call',
                pic: '../../../images/w2.png',
                des: '客服电话',
                url: '/pages/user/index/index',
                // text:'021-31038038'
                },
                {
                  pic: '../../../images/qdn/feedback.png',
                  des: '意见反馈',
                  url: '/pages/user/feedback/feedback'
                }, 
                // {
                //   pic: '../../../images/w8.jpg',
                //   des: '地址管理',
                //   url: '/pages/user/address_list/address_list'
                // }, 
                {
                  pic: '../../../images/qdn/set.png',
                  des: '设置',
                  url: '/pages/user/userinfo/userinfo'
                },
                // {
                //     pic: '../../../images/w4.png',
                //     des: '拼团订单',
                //     url: '/pages/team/team_order/team_order'
                // },
                // {
                //     pic: '../../../images/w10.png',
                //     des: '虚拟订单',
                //     url: '/pages/virtual/virtual_list/virtual_list'
                // },
                // {
                //     pic: '../../../images/w5.png',
                //     des: '积分商城',
                //     url: '/pages/goods/integralMall/integralMall'
                // },
                
                
                
                // {
                //     pic: '../../../images/w5.png',
                //     des: '我要开店',
                //     url: '/pages/newjoin/join1/join1'
                // }
            ]
        }
    },
    
    onShow: function() {
        //先预设值，加速加载
        if (app.globalData.userInfo) {
            this.setData({ userInfo: app.globalData.userInfo });
        }
        if (!app.auth.isAuth()) {
            app.showLoading(null, 1500);
        }
        var that = this;
        app.getUserInfo(function (userInfo) {
          that.setData({ userInfo: userInfo });
        }, true, false);

        console.log("userinfo");
        console.log(app.globalData);
    },
    /**下拉刷新 */
    onPullDownRefresh: function (e) {
        var that = this;
        app.getUserInfo(function (userInfo) {
            that.setData({ userInfo: userInfo });
            wx.stopPullDownRefresh();
        }, true);
    },

    /**
     * 签到
     */
    qiandao: function(e) {
      console.log('666');
      console.log(e)
      var that = this;
      request.get(that.data.url+'/api/user/qiandao',{
        success:function(res){
          console.log("res");
          console.log(res);
          
          app.showWarning(res.data.msg, function (res) { })
        }
      })
    },

    /**
     * 获得一二级粉丝数量
     */
    getfans: function(){
      var that = this;
      request.get(that.data.url+'/')
    },

    /**
     * 拨打客服电话
     */
    call: function(res){
      var that = this;
      if(res.currentTarget.id=='call'){
        wx.showModal({
          title: '提示',
          content: '是否拨打客服电话?',
          success: function (res) {
            if (res.confirm) {
              wx.makePhoneCall({
                // phoneNumber: that.data.userInfo.phone,
                phoneNumber:'18819417275',
                fail:function(){
                  console.log('yes');
                },
                success:function(){
                  console.log('nooo');
                }
              })
            } else if (res.cancel) {
              console.log('no');
            }
          }
        })
      }
    }
})