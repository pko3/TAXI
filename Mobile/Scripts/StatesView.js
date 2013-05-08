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
        this.showForm({});
    };

    this.showForm = function (data) {
        var self = this;
        $("#statesSave").click(function () { self.save(); });
        app.waiting(false);
        $("#statesForm").html(StatesView.formTemplate(data));

        $("input").bind('focus', function (event) {
            app.scrollTop();
        });
        $("select").bind('focus', function (event) {
            app.scrollTop();
        });
        $("#HistoryAction").val(data.HistoryAction);
        $("#statesForm").show();
    };
            
    this.save = function () {
        var f = $("#statesForm");
        f.hide();
        app.waiting();
        var self = this, d = f.serializeArray(), data = {};
        //serializeObject
        $.each(d, function (i, v) { data[v.name] = v.value; });
        data["GUID_Transporter"] = Service.transporter.GUID;
        data["IsTransporter"] = true;
        Service.callService("TaxiSetHistory", data,
            function () { app.home(); },
            function (d) {
                data.ErrorMessage = d.ErrorMessage;
                f.show(data);
                app.waiting(false);
            });
    };
    this.clear = function () {

    };

    this.initialize();
}

StatesView.template = Handlebars.compile($("#states-tpl").html());
StatesView.formTemplate = Handlebars.compile($("#statesForm-template").html());