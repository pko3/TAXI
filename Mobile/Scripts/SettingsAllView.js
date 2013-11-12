var SettingsAllView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function() {
        return this;
    };

    this.onShow = function () {
        var self = this;
        this.el.html(SettingsAllView.template());
        //$("#settingsallForm").hide();
        app.waiting();
        //$("#settingsallSave").click(function () { if(!$(this).hasClass("transparent")) self.save(); });
        this.loadForm();
    };

    this.save = function () {
        //$("#settingsallSave").addClass("transparent");
        $("#settingsallForm").hide();
        app.waiting();
        this.loadForm();
    };

    this.loadForm = function () {
        var self = this;
        var data = new Array;
        data[0] = { Group: "Main", Title: "RefreshSec", value: "7" };
        //data[1] = { Group: "Main", Title: "RefreshSec", value: "30" };
        //data[2] = { Group: "Main", Title: "RefreshSec", value: "30" };
        self.showForm(data);
    };


    this.showForm = function (data) {
            if(data)  data.ErrorMessage = Service.connectionError;
            $("#settingsallForm").html(SettingsAllView.templateForm(data));
            $("#settingsallForm").show();
           // $("#settingsallSave").removeClass("transparent");
            app.waiting(false);
    };

    this.initialize();
}

SettingsAllView.template = Handlebars.compile($("#settingsall-tpl").html());
SettingsAllView.templateForm = Handlebars.compile($("#settingsallForm-tpl").html());