﻿var app = {
    currentPage: null,
    currentPageName: null,
    isDevice: false,
    mediaNew : null,
    mediaAlert : null,
    pages: {},
    showAlert: function (message, title) {

        var ierr = ErrorStorage.hasError(message);


        if (navigator.notification) {
            if (ierr == 0) {
                ErrorStorage.addError(message);
                navigator.notification.alert(message, alertDismissed(message), title, 'OK');
            }
        }
        else {
            
            if (ierr == 0) {
                ErrorStorage.addError(message);
                alert(title ? (title + ": " + message) : message);
                ErrorStorage.removeError(message);
            }
        }
    },
    alertDismissed: function(message) {
        ErrorStorage.removeError(message);
    },


    tabSelector: function (tabName, pageName) {
        var tabCtrl = document.getElementById(tabName);
        var pageToActivate = document.getElementById(pageName);
        for (var i = 0; i < tabCtrl.childNodes.length; i++) {
            var node = tabCtrl.childNodes[i];
            if (node.nodeType == 1) { /* Element */
                node.style.display = (node == pageToActivate) ? 'block' : 'none';
            }
        }
    },

    showNew: function (title, content, timeout, okCallback, cancelCallback) {

       
    },

    showConfirm: function (message, title, okCallback, cancelCallback) {
        if (navigator.notification) {
            var _callback = function (btn) {
                if (btn === 1) {
                    if (okCallback) okCallback();
                }
                else {
                    if (cancelCallback) cancelCallback();
                }
            }
            navigator.notification.confirm(message, _callback, title, 'OK,Cancel');
        } else {
            if (confirm(title ? (title + ": " + message) : message)) {
                if (okCallback) okCallback();
            }
            else {
                if (cancelCallback) cancelCallback();
            }
        }
    },
    playNew: function(){
        if(app.mediaNew)
            app.mediaNew.play();
    },

    playSound: function (soundFile) {
        window.setTimeout(function () {
            if (soundFile) {
                var toplay = new Audio(soundFile);
                toplay.play();
            }
        }, 1);
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
            $(".waitingDiv").html(t);
    },
    end: function (callback) {
        if (Service.isAuthenticated) {
            if (navigator.app) {
                app.showConfirm("Odhlásiť sa z vozidla?", "Ukončenie aplikácie", function () {
                    Service.logout(function () {
                        app.showConfirm("Ukončiť aplikáciu?", "Ukončenie aplikácie", function () {
                            app.log("app.exitApp");
                            navigator.app.exitApp();
                        }, callback);
                    });
                });
            }
            else {
                app.showConfirm("Odhlásiť sa z vozidla?", "Ukončenie aplikácie", function () {
                    Service.logout(function () {
                        app.showAlert("Boli ste odhlásení z vozidla");
                        callback();
                    });
                }, callback);
            }
        }
        else if (navigator.app) {
            app.showConfirm("Ukončiť aplikáciu?", "Ukončenie aplikácie", function () {
                app.log("app.exitApp");
                navigator.app.exitApp();
            }, callback);
        }
        else callback();
    },
    submenu: function()
    {
        $('#divsubmenu').toggle(100);
    },
    registerEvents: function () {
        app.log("app.registerEvents");
        var self = this;
        $('body').on('touchmove', function (event) { event.preventDefault(); });
        $('body').on('click', '[data-route]', function (event) { app.route($(this).attr("data-route")); });
        //$('body').on('click', '#newOrder', function (event) { Service.autoOrder(); });
        $('body').on('click', '#unbreakButton', function (event) { $("#unbreakButton").hide(); Service.unBreak(); });
        $('body').on('click', '#unalarmButton', function (event) { $("#unalarmButton").hide(); Service.unAlarm(); });
        $('body').on('click', '#taxiAlarm', function (event) { Service.alarm(); });
        $('body').on('click', '#btnRecallMe', function (event) { Service.recallme(); });
        $('body').on('click', '#btnSubmenu', function (event) { app.submenu(); });
                        
        $('#unbreakButton').hide();
        $('#unalarmButton').hide();

        //deviceready
        //pause
        //resume
        //online
        //offline
        //backbutton
        //menubutton
        //searchbutton
        try {
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
            }, false);

        } catch (err) {
            app.log(err);
        }

        try {
            if (app.isDevice)
                self.mediaNew = new Media(app.getPhoneGapPath() + "audio/sound_order.mp3");
            else
                self.mediaNew = new Audio("audio/sound_order.mp3");
        }
        catch (err) {
            app.log("Media: " + err);
        }
    },
    home: function (refresh) {
        app.route("orders");
        if (refresh)
            app.currentPage.loadData();
    },
    settings: function () {
        if (this.currentPageName != "settings")
            this.route("settings");
    },
    route: function (p) {
        app.log("app.route: " + p);
        if (!Service.isComplet() && p != "settings")
            p = "settings";
        var self = this;
        var page = this.pages[p];
        if (!page) {
            switch (p) {
                case "orders": page = new OrdersView().render(); this.homePage = page; break;
                case "messages": page = new MessageView().render(); break;
                case "history": page = new OrdersHistoryView().render(); break;
                case "stand": page = new StandView().render(); break;
                case "historyme": page = new OrdersHistoryView().render(); break;
                case "states": page = new StatesView().render(); break;
                case "map": page = new MapView().render(); break;
                case "allsettings": page = new SettingsAllView().render(); break;
                case "settings": page = new SettingsView().render(); break;
                case "detail": page = new OrderDetail().render(); break;
                case "autoorder": page = new AutoOrderView().render(); break;
                default: this.showAlert("Undefined page:" + p, "ERROR"); return;
            }
            this.pages[p] = page;
        }
        this.currentPageName = p;
        this.slidePage(page);
    },
    slidePage: function (page) {
        var currentPageDest, self = this;

        if (!this.currentPage) {
            //$(page.el).attr('class', 'page stage-center');
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

        //if (page.index < this.currentPage.index) {
        //    $(page.el).attr('class', 'page stage-left');
        //    currentPageDest = "stage-right";
        //} else {
        //    $(page.el).attr('class', 'page stage-right');
        //    currentPageDest = "stage-left";
        //}

        $('body').append(page.el);

        setTimeout(function () {
            $(self.currentPage.el).hide();//.attr('class', 'page transition ' + currentPageDest);
            $(page.el).show();
            //$(page.el).attr('class', 'page stage-center transition');
            if (page.onShow)
                page.onShow();
            else
                self.waiting(true);
            self.currentPage = page;
            //$('.stage-right, .stage-left').remove();
        });
    },
    refreshData: function (dataIds, callback) {
        var isCallback = false;
        if (dataIds) {
            $.each(dataIds, function () {
                if(this == "orders"){
                    if (app.currentPageName == "orders") {
                        app.currentPage.loadData();
                    }
                }
                else if (this == "transporters") {
                    isCallback = true;
                    app.refreshTransporter(callback);
                }
            });
        }
        if (!isCallback && callback)
            callback();
    },
    refreshTransporter: function (callback)
    {
        var settings = Service.getSettings();
        if (settings.transporterId) {
            app.log("app.refreshTransporter");
            Service.getDetail("Transporter", settings.transporterId, function (d) {
                Service.transporter = d;
                app.setHeader();
                if (callback) callback(d);
            });
        }
    },
    setHeader: function(){
        var settings = Service.getSettings();
        $("#taxiHeader")
                   .removeClass()
                   .addClass(Service.transporter.Status);
        $("#taxiText")
            .empty()
            .html(settings.name + " " + Service.transporter.SPZ + " [" + Service.getTransporterStatusText()+"]");
    },
    getPhoneGapPath: function () {
        if (app.isDevice) {
            var path = window.location.pathname;
            path = path.substr(path, path.length - 10);
            return 'file://' + path;
        }
        else return "";
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
    },
    radio: function (el, input)
    {
        var v = input.val();
        $.each(el.children('[data_value]'), function () {
            var $this = $(this);
            if($this.attr('data_value') === v)
                $this.addClass("selected");
            else
                $this.removeClass("selected");
            $this.click(function () {
                $this.siblings().removeClass("selected");
                $this.addClass("selected");
                input.val($this.attr("data_value"));
            });
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

function showMenu() {
    document.getElementById("submenu").style.display = "block";
}
function hideMenu() {
    document.getElementById("submenu").style.display = "none";
}


