var SettingsView = function (messages) {

    this.index = 5;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function() {
        this.el.html(SettingsView.template({id:123}));
        return this;
    };

    this.initialize();
}

SettingsView.template = Handlebars.compile($("#settings-tpl").html());