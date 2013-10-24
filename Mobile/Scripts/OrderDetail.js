var OrderDetail = function () {

    this.index = 4;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(OrderDetail.template());
        return this;
    };

    this.onShow = function () {
        var self = this;
        DetailMap.initialize($("#orderDetailMap"));
        $("#orderDetailBack").click(function () { app.home(); });
        $("#orderDetailSave").click(function () { self.save(); });
        $("#orderCall").click(function () {
            Service.recallOrder(function () {
                self.setButtons();
            });
        });

        this.loadData();
    };

    this.setInitTime = function () {

        if (this.order.Status == "Offered")
        {
            $("#OrderTimeToRealize").val(constants.OrderDetail_Defauls_timeToRealize);
        }
    };


    this.setTime = function () {
        if (this.order.TimeToRealize) {
            $("#OrderTimeToRealize").val(this.order.TimeToRealize);
        }
    };


    this.setButtons = function () {

        if (this.order.Status != "Waiting")
            $("#orderCall").hide();
        else if (this.order.RecallNeed) 
            $("#orderCall").removeClass("ico_phone").addClass("ico_hangup").show();
        else
            $("#orderCall").removeClass("ico_hangup").addClass("ico_phone").show();

        this.setInitTime();

       this.setTime();

        //if (this.order.Status == "Canceled" || this.order.Status == "Waiting" || this.order.Status == "Processing") {
        //    $("#orderDetailSave").hide();
        //    $("#OrderTimeToRealize").hide();
        //}
        //else

        //ak nebola prijata objednavka, tak rozbaleny selector casov
        //$("#OrderTimeToRealize").click();
        //if (this.order.Status == "Offered")
        //{
        //    $("#OrderTimeToRealize").select();
        //}

        if (this.order.Status == "New" || this.order.Status == "Offered")
            $("#orderDetailSave").show().text("Prijať objednávku");
        else
            $("#orderDetailSave").show().text("Zmeniť čas");
    };

    this.loadData = function () {
        this.order = Service.orders.Current;
        if (this.order) {
            $("#orderDetailForm").html(OrderDetail.detailTemplate(this.order));
            this.setButtons();
            if (this.order.StartLatitude) {
               // $("#orderDetailMap").height($(window).height() - $("#orderDetailForm").outerHeight() - 66);
                DetailMap.setMap(this.order.StartLatitude, this.order.StartLongitude, PositionService.lat, PositionService.lng);
            }

            //zobrazit rozbaleny cas, ak sa jedna o ponuku
            if (this.order.Status == "Offer")
            {

            }
        }
    };

    this.save = function () {


        var tr = parseInt($("#OrderTimeToRealize").val(), 10);
        var settings = Service.getSettings(), self = this;

        if (isNaN(tr))
        {
            app.showAlert("Vyberte čas", "Chyba");
            return;
        }

        var data = {
            Action: "Up",
            IsTransporter: true,
            GUID_Transporter: settings.transporterId,
            Status_Transporter: settings.transporterState,
            GUID: this.order.GUID_Offer,
            Status: this.order.StatusOffer,
            GUID_TransporterOrder: this.order.GUID,
            Status_TransporterOrder: this.order.Status,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng,
            TimeToRealize: tr
        };

        if (this.order && (this.order.Status == "New" || this.order.Status == "Offered")) {
            //Up
            Service.callService("transporteroffer", data, function () { app.home(); });
        }
        else {
            Service.callService("OrderTimeToRealize", data, function () { app.home(); });
        }
    };

    this.initialize();
}

OrderDetail.template = Handlebars.compile($("#orderDetail-tpl").html());
OrderDetail.detailTemplate = Handlebars.compile($("#orderDetailForm-tpl").html());