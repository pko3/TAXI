var OrdersView = function() {
    this.index = 1;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function() {
        this.el.html(OrdersView.template());
        return this;
    };

    this.loadData = function () {
        var self = this;
        $('.orders-list').hide();
        $(".waitingDiv").show();
        Service.getOrders(function (orders) {
            $('.orders-list').html(OrdersView.liTemplate(orders.Items));
            if (self.iscroll) 
               self.iscroll.refresh();
            else 
                self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
            $(".waitingDiv").hide();
            $(".up").click(function () { self.changeOffer($(this).parent(), "Up"); });
            $(".down").click(function () { self.changeOffer($(this).parent(), "Down"); });
            $('.orders-list').show();
        });
        app.refreshTransporter();
    };
    this.changeOffer = function (btn, action) {
        
        var settings = Service.getSettings(), self = this;
        var data = {
            Action: action,
            GUID_Transporter: settings.transporterId,
            Status_Transporter: settings.transporterState,
            GUID: btn.attr("data_GUID_Offer"),
            Status: btn.attr("data_StatusOffer"),
            GUID_TransporterOrder: btn.attr("data_Id"),
            Status_TransporterOrder: btn.attr("data_Status"),
        };

        btn.removeClass().addClass("refWaiting");
        Service.callService("offer", data, function () { self.loadData(); }, function () { self.loadData(); });
    }

    this.onShow = function () {
        this.loadData();
    }
    this.initialize();
}

OrdersView.template = Handlebars.compile($("#orders-tpl").html());
OrdersView.liTemplate = Handlebars.compile($("#orders-li-tpl").html());