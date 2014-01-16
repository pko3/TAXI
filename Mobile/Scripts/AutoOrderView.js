var AutoOrderView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function() {
        this.el.html(AutoOrderView.template());
        return this;
    };

    this.onShow = function () {
        this.showForm({});
    };

    this.showForm = function (data) {
        var self = this;
        $("#autoorderSave").click(function () { self.save(); });
        app.waiting(false);
        $("#autoorderForm").html(AutoOrderView.formTemplate(data));
        this.loadData();
        $("#autoorderForm").show();
        
    };
    
    this.loadData = function () {
        $("#TimeToRealize").val(Globals.constants.OrderDetail_Defauls_timeToRealize);
        //$("#EndCity").val("hhh");
    }

    this.save = function () {
        var f = $("#autoorderForm");
        f.hide();
        app.waiting();

        var self = this, d = f.serializeArray(), data = {};
        $.each(d, function (i, v) { data[v.name] = v.value; });

        var EndCity = data["EndCity"];
        var EndAddress = data["EndAddress"];
        var TimeToRealize = data["TimeToRealize"];

        //call service with callback
        alert('autoOrder2');
        Service.autoOrder2(EndCity, EndAddress, TimeToRealize,app.home());

        ////stop waiting
        //app.waiting(false);
        ////notify
        //NotificationLocal.Notify("autoOrder", data, null, null);
        ////return
        //app.home();
    };
    this.clear = function () {
    };

    this.initialize();
}

AutoOrderView.template = Handlebars.compile($("#autoorder-tpl").html());
AutoOrderView.formTemplate = Handlebars.compile($("#autoorderForm-template").html());