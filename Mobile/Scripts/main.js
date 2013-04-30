var app = {
    currentPage: null,
    currentPageName: null,
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },

    registerEvents: function () {
        var self = this;
        $('body').on('click', '[data-route]', function (event) { app.route($(this).attr("data-route")); });
        // Check of browser supports touch events...
        //if (document.documentElement.hasOwnProperty && document.documentElement.hasOwnProperty('ontouchstart')) {
        //    // ... if yes: register touch event listener to change the "selected" state of the item
        //    $('.buttonlist').on('touchstart', 'button', function (event) {
        //        $(event.target).addClass('tappable-active');
        //    });
        //    $('body').on('touchend', 'button', function (event) {
        //        $('.tappable-active').removeClass('tappable-active');
        //    });
        //} else {
        //    // ... if not: register mouse events instead
        //    $('.buttonlist').on('mousedown', 'button', function (event) {
        //        $(event.target).addClass('tappable-active');
        //    });
        //    $('body').on('mouseup', 'button', function (event) {
        //        $('.tappable-active').removeClass('tappable-active');
        //    });
        //}
    },
    home: function(){
        this.route("orders");
    },
    settings: function () {
        if (this.currentPageName != "settings")
            this.route("settings");
    },
    route: function (p) {
        if (!Service.isComplet() && p != "settings")
            p = "settings";
        //$('[data-route]').removeClass("selected");
            var self = this;
            var page = this.pages[p];
            if (!page) {
                switch (p) {
                    case "orders": page = new OrdersView().render(); this.homePage = page; break;
                    case "message": page = new MessageView().render(); break;
                    case "states": page = new StatesView().render(); break;
                    case "map": page = new MapView().render(); break;
                    case "settings": page = new SettingsView().render(); break;
                    default: this.showAlert("Undefined page:" + p, "ERROR"); return;
                }
                this.pages[p] = page;
            }
           // $('[data-route="'+p+'"]').addClass("selected");
            this.currentPageName = p;
            this.slidePage(page);
    },
    slidePage: function (page) {

        var currentPageDest, self = this;

        // If there is no current page (app just started) -> No transition: Position new page in the view port
        if (!this.currentPage) {
            $(page.el).attr('class', 'page stage-center');
            $('body').append(page.el);
            this.currentPage = page;
            setTimeout(function () {
                if (page.onShow) 
                    page.onShow();
                else
                    $(".waiting").hide();
            });
            return;
        }

        if (this.currentPage === page)
            return;

        // Cleaning up: remove old pages that were moved out of the viewport
         //.not('.homePage')
        if (page.index < this.currentPage.index) {
            // Always apply a Back transition (slide from left) when we go back to the search page
            $(page.el).attr('class', 'page stage-left');
            currentPageDest = "stage-right";
        } else {
            // Forward transition (slide from right)
            $(page.el).attr('class', 'page stage-right');
            currentPageDest = "stage-left";
        }

        $('body').append(page.el);

        // Wait until the new page has been added to the DOM...
        setTimeout(function () {
            // Slide out the current page: If new page slides from the right -> slide current page to the left, and vice versa
            $(self.currentPage.el).attr('class', 'page transition ' + currentPageDest);
            // Slide in the new page
            $(page.el).attr('class', 'page stage-center transition');

            if (page.onShow)
                page.onShow();
            else
                $(".waiting").hide();

            self.currentPage = page;
            
            $('.stage-right, .stage-left').remove();
        });
    },
    initialize: function() {
        var self = this;
        this.pages = {};
        this.registerEvents();
        Service.initialize(function () {
            self.home();
        });
    }
};

//$(window).load(function(){
    app.initialize();
//});