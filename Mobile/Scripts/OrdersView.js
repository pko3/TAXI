var OrdersView = function() {
    this.index = 1;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(OrdersView.template());

        //if (app.isDevice) {
        //    $(window).unload(function () {
        //        app.log("powermanagement.release");
        //        try {
        //            cordova.require('cordova/plugin/powermanagement').release(
        //                    function () { app.info("powermanagement OK"); },
        //                    function () { app.info("powermanagement Error"); }
        //            );
        //        }
        //        catch (err) {
        //            app.info("powermanagement Error: " + err)
        //        }
        //    });
            
        //    try {
        //        app.log("powermanagement.acquire");
        //        cordova.require('cordova/plugin/powermanagement').acquire(
        //                       function () { app.info("powermanagement OK"); },
        //                       function () { app.info("powermanagement Error"); }
        //                       );
        //    }
        //    catch (err) {
        //        app.info("powermanagement Error: " + err)
        //    }
        //}
        return this;
    };

    this.loadData = function () {
        var self = this;
        $('.orders-list').hide();
        app.waiting();
        Service.getOrders(function (orders) {
            $('.orders-list').html(OrdersView.liTemplate(orders.Items));
            if (self.iscroll) 
               self.iscroll.refresh();
            else 
                self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
            app.waiting(false);
            
            $(".up").click(function () { self.changeOffer($(this).parent(), "Up"); });
            $(".down").click(function () { self.changeOffer($(this).parent(), "Down"); });
            //$(".orderTimeToFree").click(function () { $(this).focus(); }).change(function () { alert($(this).val()); });
            //
            $('.orders-list').show();
            //$(".content").append('<div class="orderTimeToFree"><select class="orderTimeToFree" name="aa"><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hod</option><option value="120">2 hod</option><option value="240">4 hod</option></select></div>');
        });
        //app.refreshTransporter();
    };
    this.changeOffer = function (btn, action) {

        var settings = Service.getSettings(), self = this;
        var data = {
            Action: action,
            IsTransporter: true,
            GUID_Transporter: settings.transporterId,
            Status_Transporter: settings.transporterState,
            GUID: btn.attr("data_GUID_Offer"),
            Status: btn.attr("data_StatusOffer"),
            GUID_TransporterOrder: btn.attr("data_Id"),
            Status_TransporterOrder: btn.attr("data_Status"),
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        };
        btn.removeClass().addClass("refWaiting");

        data.Latitude = PositionService.lat,
        data.Longitude = PositionService.lng
        Service.callService("offer", data);
    };
    this.onShow = function () {
        $("#taxiHeader").click(function () { app.refreshData(["orders", "transporters"]); });
        this.loadData();
    };
    this.initialize();
}

OrdersView.template = Handlebars.compile($("#orders-tpl").html());
OrdersView.liTemplate = Handlebars.compile($("#orders-li-tpl").html());