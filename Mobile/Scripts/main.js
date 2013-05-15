var app = {
    currentPage: null,
    currentPageName: null,
    isDevice : false,
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },
    info: function(t){
        $("#taxiInfo").html(t);
    },
    waiting: function (show) {
        if (show == false)
            $(".waitingDiv").empty().hide();
        else
            $(".waitingDiv").show();
    },
    log: function (t) {
        if ($(".waitingDiv").is(":visible"))
            $(".waitingDiv").append($("<p>" + t + "</p>"));
        else
            app.info(t);
    },
    registerEvents: function () {
        app.log("app.registerEvents");
        var self = this;
        $('body').on('click', '[data-route]', function (event) { app.route($(this).attr("data-route")); });
        
        //deviceready
        //pause
        //resume
        //online
        //offline
        //backbutton
        //menubutton
        //searchbutton
        try{
            document.addEventListener('pause', function () { app.info("Pause"); }, false);
            document.addEventListener('resume', function () { app.info("Resume"); }, false);
            document.addEventListener("offline", function () { app.info("Offline"); }, false);
            document.addEventListener("online", function () { app.info("Online"); }, false);
            document.addEventListener("unload", function () {
                app.info("Unload");
                cordova.require('cordova/plugin/powermanagement').release(
                            function () { app.info("powermanagement Release"); },
                            function () { app.info("powermanagement Error Release"); }
                    );
            }, false);
            document.addEventListener("menubutton", function () { e.preventDefault(); app.settings(); }, false);
            document.addEventListener("backbutton", function (e) {
                if (app.currentPageName != "orders") {
                    e.preventDefault();
                    app.home();
                }
                //else {
                //    if (confirm("Ukonèi aplikáciu?")) {
                //        app.log("app.exitApp");
                //        navigator.app.exitApp();
                //    }
                //}
            }, false);
        } catch (err) {
            app.log(err);
        }

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
    home: function () {
        this.route("orders");
    },
    settings: function () {
        if (this.currentPageName != "settings")
            this.route("settings");
    },
    route: function (p) {
        app.log("app.route: " + p);
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
                    app.waiting(false);
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
                self.waiting(true);

            self.currentPage = page;
            
            $('.stage-right, .stage-left').remove();
        });
    },
    scrollTop: function () {
            window.scrollTo(0, 0);
        document.body.scrollTop = 0;
    },
    refreshData: function (dataIds) {
        if (dataIds) {
            $.each(dataIds, function () {
                if(this == "orders"){
                    if (app.currentPageName == "orders")
                        app.currentPage.loadData();
                }
                else if(this == "transporters")
                    app.refreshTransporter();
            });
        }
    },
    refreshTransporter: function ()
    {
        app.log("app.refreshTransporter");
        var settings = Service.getSettings();
        Service.getDetail("Transporter", settings.transporterId, function (d) {
            Service.transporter = d;
            $("#taxiHeader")
                .removeClass()
                .addClass(d.Status);
            $("#taxiText")
                .empty()
                .html(d.TransporterNo + " " + d.Title  + " " + d.SPZ);
        });
    },
    initialize: function () {
        app.log("app.initialize");
        app.log("app.isDevice: " + this.isDevice);
        var self = this;
        this.pages = {};
        this.registerEvents();
        Service.initialize(function () {
            self.home();
        });
    }
};


function onLoad() {
    app.isDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
    if (app.isDevice) {
        document.addEventListener("deviceready", function () { app.initialize(); }, false);
    } else {
        app.initialize();
    }
}

//$(window).load(function () {
    //if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    //    app.isDevice = true;
    //    document.addEventListener("deviceready", function () { app.initialize(); }, false);
    //} else {
        //app.initialize(); 
    //}
//});

        //$(document).ready(function () {
        //    app.isDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
        //    if (app.isDevice) {
        //        document.addEventListener("deviceready", function () { app.initialize(); }, false);
        //    } else {
        //        app.initialize();
        //    }
        //});

//if (window.cordova) {
//    document.addEventListener("deviceready", function () { app.initialize(); }, true);
//}
//else {
//    $(window).load(function () { app.initialize(); });
//}

//document.addEventListener("deviceready", onDeviceReady, false);
//$(window).load(function(){ app.initialize();});