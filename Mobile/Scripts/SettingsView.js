var SettingsView = function (messages) {
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
        this.el.html(SettingsView.template());
        $("#settingsForm").hide();
        $(".waiting").show();
        $("#settingsSave").click(function () { self.save(); }).hide();
        this.loadForm();
    };
    this.save = function () {
        $("#settingsSave").hide();
        $("#settingsForm").hide();
        $(".waiting").show();

        var self = this, d = $("#settingsForm-form").serializeArray(), data = {};
        //serializeObject
        $.each(d, function (i, v) { data[v.name] = v.value; });

        Service.saveSettings(data);
        Service.login(function () {
            if (Service.isComplet())
                app.home();
            else 
                self.loadForm();
        });
    };
    this.loadForm = function () {
        var self =this, data = Service.getSettings();
        if (Service.isAuthenticated) 
            Service.getTransporters(function (d) {
                data.transportes = d.Items;
                self.showForm(data);
            });
        else self.showForm(data);
    };
    this.showForm = function (data) {
            data.ErrorMessage = Service.connectionError;
            $(".waiting").hide();
            $("#settingsForm").html(SettingsView.templateForm(data));
            $("#settingsForm").show();
            $("#settingsSave").show();
    };

    this.initialize();
}

SettingsView.template = Handlebars.compile($("#settings-tpl").html());
SettingsView.templateForm = Handlebars.compile($("#settingsForm-tpl").html());