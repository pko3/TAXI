var StatesView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
        this.loadData();
    };

    this.render = function() {
        this.el.html(StatesView.template());
        return this;
    };

    this.onShow = function () {
        this.el.on('click', 'button', this.setState);
    }

    this.setState = function ()
    {
        $("[data-state]").removeClass("selected");
        $(this).addClass("selected");
        //app.showAlert($(this).attr("data-state"), "data-state");
    }

    this.loadData = function () {
        var self = this;
        Service.getStates(function (states) {
            $('.states-list').html(StatesView.liTemplate(states));
            if (self.iscroll)
               self.iscroll.refresh();
            else
               self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
        });
    };
    this.initialize();
}

StatesView.template = Handlebars.compile($("#states-tpl").html());
StatesView.liTemplate = Handlebars.compile($("#states-li-tpl").html());