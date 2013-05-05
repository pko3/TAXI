var StatesView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function() {
        this.el.html(StatesView.template());
        return this;
    };

    this.onShow = function () {
        var self = this;
        $("#statesSave").click(function () { self.save(); });
    }
        
    this.save = function () {
        var self = this, d = $("#statesForm-form").serializeArray(), data = {};
        //serializeObject
        $.each(d, function (i, v) { data[v.name] = v.value; });
        data["GUID_Transporter"] = Service.transporter.GUID;
        Service.callService("TaxiSetHistory", data, function () { app.home(); });
    };

    this.initialize();
}

StatesView.template = Handlebars.compile($("#states-tpl").html());
//StatesView.liTemplate = Handlebars.compile($("#states-li-tpl").html());