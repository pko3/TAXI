var OrdersView = function() {
    this.index = 1;
    this.initialize = function() {
        this.el = $('<div/>');
        //this.el.on('keyup', '.search-key', this.findByName); //, 
        this.loadData();
    };

    this.render = function() {
        this.el.html(OrdersView.template());
        return this;
    };

    this.loadData = function () {
        var self = this;
        Service.getOrders(function (orders) {
            $('.orders-list').html(OrdersView.liTemplate(orders));
            if (self.iscroll) 
               self.iscroll.refresh();
            else 
               self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
        });
    };
    this.initialize();
}

OrdersView.template = Handlebars.compile($("#orders-tpl").html());
OrdersView.liTemplate = Handlebars.compile($("#orders-li-tpl").html());