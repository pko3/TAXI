var MessageView = function (messages) {

    this.index = 3;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function() {
        this.el.html(MessageView.template(messages));
        return this;
    };

    this.initialize();

}

MessageView.template = Handlebars.compile($("#message-tpl").html());