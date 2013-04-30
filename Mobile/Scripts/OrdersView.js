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
        $(".waiting").show();
        Service.getOrders(function (orders) {
            $('.orders-list').html(OrdersView.liTemplate(orders.Items));
            if (self.iscroll) 
               self.iscroll.refresh();
            else 
                self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
            $(".waiting").hide();
            $('.orders-list').show();
        });
    };

    this.onShow = function () {
        this.loadData();
    }
    this.initialize();
}

OrdersView.template = Handlebars.compile($("#orders-tpl").html());
OrdersView.liTemplate = Handlebars.compile($("#orders-li-tpl").html());