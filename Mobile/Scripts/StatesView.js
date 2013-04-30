var StatesView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
        //this.loadData();
    };

    this.render = function() {
        this.el.html(StatesView.template());
        return this;
    };

    this.onShow = function () {
        //$("#states").on('click', 'button', function () {
        //    if ($("#states").hasClass("collapsed"))
        //        $("#states").removeClass("collapsed");
        //    else {
        //        $(this).addClass("selected");
        //        $("#states").addClass("collapsed");
        //    }
        //});
    }

    //this.loadData = function () {
    //    var self = this;
    //    Service.getStates(function (states) {
    //        $('#states').html(StatesView.liTemplate(states));
    //        if (self.iscroll)
    //           self.iscroll.refresh();
    //        else
    //           self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
    //    });
    //};
    this.initialize();
}

StatesView.template = Handlebars.compile($("#states-tpl").html());
//StatesView.liTemplate = Handlebars.compile($("#states-li-tpl").html());