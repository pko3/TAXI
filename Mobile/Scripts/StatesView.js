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
        this.loadData();
    }

    this.loadData = function () {

    };
    this.initialize();
}

StatesView.template = Handlebars.compile($("#states-tpl").html());
//StatesView.liTemplate = Handlebars.compile($("#states-li-tpl").html());