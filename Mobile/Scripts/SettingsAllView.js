var SettingsAllView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
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
        var s = Service.getSettings();
        var data = new Array;
        data[0] = { Group: "Main", Title: "RefreshSec", value: "7" };
        data[1] = { Group: "Local", Title: "inRecall", value:  GLOB_RecallMe.toString() };
        data[2] = { Group: "Local", Title: "GUID_Transporter", value: s.transporterId };
        data[3] = { Group: "Local", Title: "GUID_sysUser", value: s.userId };




        self.showForm(data);
    };


    this.showForm = function (data) {
        if (data) data.ErrorMessage = Service.connectionError;



        $("#settingsallForm").html(SettingsAllView.templateForm(data));

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

            $("#settingsallForm").show();
           // $("#settingsallSave").removeClass("transparent");
            app.waiting(false);
    };

    this.initialize();
}

SettingsAllView.template = Handlebars.compile($("#settingsall-tpl").html());
SettingsAllView.templateForm = Handlebars.compile($("#settingsallForm-tpl").html());