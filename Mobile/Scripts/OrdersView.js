﻿var g_OrdersCheckSum = '';
var g_OrdersLastRefresh = null;
var g_OrdersRefreshCount = 0;



var OrdersView = function () {
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
        $('#unbreakButton').hide();
        $('#unalarmButton').hide();

        if (!Service.transporter) {
            $('.orders-list').html("");
            app.waiting(false);
            return;
        }

        $('.orders-list').hide();
        app.waiting();
        app.setHeader();

        if (Service.transporter.inAlarm) {
            $('#unalarmButton').show();
            app.waiting(false);
        }
        else  if (Service.transporter.Status == "Break") {
            $('#unbreakButton').show();
            app.waiting(false);
        }
        else {
            Service.getOrders(function (orders) {

                //check sum pre monzinu orders
                c_OrdersCheckSum = '';
                //nstavime datum refreshu
                g_OrdersLastRefresh = new Date();

                $.each(orders.Items, function () {
                    this.FormatedDate = Service.formatJsonDate(this.Date);
                    if (this.Status == 'Cancel')
                        this.StatusCancel = "Y";
                    c_OrdersCheckSum += this.Status + this.Date;
                });

                //vyhodnotit checksum 
                if (g_OrdersCheckSum != c_OrdersCheckSum) //zvukovy signal
                        app.playNew();
                g_OrdersCheckSum = c_OrdersCheckSum;


                $('.orders-list').html(OrdersView.liTemplate(orders.Items));
                if (self.iscroll)
                    self.iscroll.refresh();
                else
                    self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
                app.waiting(false);

                $(".up").click(function () { self.changeOffer($(this).parent(), "Up"); });
                $(".cancel").click(function () { self.changeOffer($(this).parent(), "Down"); });
                $(".confirmCancel").click(function () { self.changeOffer($(this).parent(), "Down"); });
                $(".content").click(function () { self.detail($(this).parent()); });
                //$(".orderTimeToFree").click(function () { $(this).focus(); }).change(function () { alert($(this).val()); });
                //
                $('.orders-list').show();
                //$(".content").append('<div class="orderTimeToFree"><select class="orderTimeToFree" name="aa"><option value="5">5 min</option><option value="10">10 min</option><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">1 hod</option><option value="120">2 hod</option><option value="240">4 hod</option></select></div>');
            });
        }
    };
    this.detail = function (btn) {
        var self = this;
        //Service.detail(btn.attr("data_localId"));
        Service.orders.Current = Service.findOrder(btn.attr("data_Id"));
        if (Service.orders.Current)
            app.route("detail");
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

        if(action == "Up" && (data.Status == "New" || data.Status == "Offered"))
        {
            Service.orders.Current = Service.findOrder(data.GUID_TransporterOrder);
            if (Service.orders.Current)
                app.route("detail");
            return;
        }

        btn.removeClass().addClass("refWaiting");

        Service.callService("transporteroffer", data);
    };
    this.onShow = function () {
        $("#taxiHeader").click(function () { app.refreshData(["orders", "transporters"]); });
        this.loadData();
    };
    this.initialize();
}

OrdersView.template = Handlebars.compile($("#orders-tpl").html());
OrdersView.liTemplate = Handlebars.compile($("#orders-li-tpl").html());
OrdersView.unbreakTemplate = Handlebars.compile($("#orders-unbreak").html());