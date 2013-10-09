var OrdersHistoryView = function() {

    this.index = 1;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(OrdersHistoryView.template());
        return this;
    };

    this.loadData = function () {
        var self = this;
        $('.ordersHistory-list').hide();
        app.waiting();

        Service.getHistoryOrders(function (orders) {

            $.each(orders.Items, function () {
                this.FormatedDate = Service.formatJsonDate(this.Date);
            });

            $('.ordersHistory-list').html(OrdersHistoryView.liTemplate(orders.Items));
            if (self.iscroll)
                self.iscroll.refresh();
            else
                self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
            app.waiting(false);

            $('.ordersHistory-list').show();

        });
    };
    
    this.onShow = function () {
        this.loadData();
    };
    this.initialize();
}

OrdersHistoryView.template = Handlebars.compile($("#ordersHistory-tpl").html());
OrdersHistoryView.liTemplate = Handlebars.compile($("#ordersHistory-li-tpl").html());
