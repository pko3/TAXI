var Service = {
    online: false,
    ordersVer: undefined,
    transporterVer: undefined,
    transporter: null,
    orders: null,
    isSendloginHistory: false,
    isAuthenticated: false,
    isComplet: function () {
        return this.isAuthenticated
            && this._settings
            && this._settings.transporterId;
    },
    isChanged: function (data) {
        var s = this.getSettings();
        return this.isAuthenticated != data.isAuthenticated
        || this._settings.transporterId != data.TransporterId
        || this._settings.name != data.name
        || this._settings.url != data.url;
    },
    connectionError: undefined,
    _settings: {
        name: undefined,
        password: undefined,
        userId: undefined,
        transporterId: undefined,
        transporterSPZ: undefined,
        url: undefined,
        sessionId: undefined,
        enableHighAccuracy: true
    },
    initialize: function (callback) {
        app.log("Service.initialize");
        //Cross domain !!!
        $.support.cors = true;
        $.ajaxSetup({
            cache: false,
            timeout: 30000,
            error: function (jqXHR, textStatus, errorThrown) {
                switch (jqXHR.status) {
                    case 403: Service.connectionError = "Chybné prihlásenie"; break;
                    default: Service.connectionError = "Služba sa nenašla (" + jqXHR.status + "):" + this.url; break;
                }
            }
        });

        this.login(callback);
        //callback();
    },
    login: function (callback) {
        app.log("Service.login");
        this.getSettings();
        Service.isAuthenticated = false;
        if (this._settings.url && this._settings.name && this._settings.password)
            this.callService("login", { UserName: this._settings.name, Password: this._settings.password, RememberMe: true, TransporterId: this._settings.transporterId }, function (d) {
                Service.isAuthenticated = true;
                var s = Service.getSettings();
                s.userId = d.userId;
                s.sessionId = d.sessionId;
                Service.saveSettings(s);
                if (Service.isComplet()) {
                    PositionService.startWatch();
                    Service.loginHistory();

                    app.refreshTransporter(callback);
                    //navigator.geolocation.getCurrentPosition(function (position) {
                    //    PositionService.lat = position.coords.latitude;
                    //    PositionService.lng = position.coords.longitude;
                    //    Service.loginHistory()
                    //}, function () { Service.loginHistory() });
                }
                else if (callback) callback();

            }, function (d) {
                //PositionService.stopWatch();
                if (d.ErrorMessage)
                    Service.connectionError = d.ErrorMessage;
                else
                    Service.connectionError = "Chybné prihlásenie";
                Service.isAuthenticated = false;
                if (callback)
                    callback();
            });
        else
            app.settings();
    },
    loginHistory: function (callback) {
        if (!Service.isSendloginHistory) {
            var s = Service.getSettings();
            Service.callService("TaxiSetHistory", {
                GUID_Transporter: s.transporterId,
                GUID_sysUser_Driver: s.userId,
                HistoryAction: "Driver login",
                IsTransporter: true,
                Latitude: PositionService.lat,
                Longitude: PositionService.lng
            },
            function () {
                Service.isSendloginHistory = true;
                //Notification.initialize();
                if (callback) callback();
            },
            function () { if (callback) callback(); });
        }
    },
    logout: function (callback) {
        if (Service.isAuthenticated) {
            PositionService.stopWatch();
            Service.isAuthenticated = false;
            var s = Service.getSettings();
            Service.callService("TaxiSetHistory", {
                GUID_Transporter: s.transporterId,
                GUID_sysUser_Driver: null,
                HistoryAction: "Driver logout",
                IsTransporter: true,
                Latitude: PositionService.lat,
                Longitude: PositionService.lng
            },
                function () {
                    Service.isSendloginHistory = false;
                    if (callback) callback();
                },
                function () { if (callback) callback(); });
        }
        else
            if (callback) callback();
    },
    findOrder: function (id) {
        if (this.orders && this.orders.Items) {
            var r = $.grep(this.orders.Items, function (o) { return o.GUID == id; });
            if (r.length > 0)
                return r[0];
        }
        return undefined;
    },
    autoOrder: function () {
        app.showConfirm("Prijať objednávku?", "Objednávka", function () {
            var s = Service.getSettings();
            Service.callService("MobileAutoOrder", { GUID_Transporter: s.transporterId, OrderSource: "Auto", OrderSourceDescription: "autoOrder", Latitude: PositionService.lat, Longitude: PositionService.lng }, function () { app.home(true); }, function () { app.home(true); });
        });
    },
    getOrders: function (callback) {
        var self = this;
        this.callService("datamobile", { Id: "transporterorders", IdTransporter: this._settings.transporterId }, function (orders) {
            Service.orders = orders;
            if (Service.orders && Service.orders.Items)
                $.each(Service.orders.Items, function () {
                    self.setOrderDescription(this);
                });
            if (callback)
                callback(orders);
        });
    },

    setOrderDescription: function (order) {
        if (!order.GUID)
            order.Status = "";
        switch (order.Status) {
            case "New": order.StatusDescription = "Poslaná"; break;
            case "Offered": order.StatusDescription = "Ponúknutá"; break;
            case "Reserved": order.StatusDescription = "Rezervovaná"; break;
            case "Waiting": order.StatusDescription = "Pristavené"; break;
            case "Cancel": order.StatusDescription = "Zrušená"; break;
            case "Processing": order.StatusDescription = "Transport"; break;
            default: order.StatusDescription = "Vybavená"; break;
        }
        //order.FormatedDate = Service.formatDate(order.OrderToDate);
    },
    getMessages: function (callback) {
        this.callService("datamobile", { Id: "transporterMessages" }, callback);
    },

    getHistoryOrders: function (callback) {
        this.callService("datamobile", { Id: "orders_lastforDriver", IdTransporter: this._settings.transporterId }, callback);
    },

    getHistoryOrdersMe: function (callback) {
        this.callService("datamobile", { Id: "orders_lastforDriverMe", IdTransporter: this._settings.transporterId }, callback);
    },

    getTransporters: function (callback) {
        var self = this;
        this.callService("datamobile", { Id: "transporterssimple" }, function (d) {
            if (d.Items) {
                $.each(d.Items, function () {
                    if (this.Id == self._settings.transporterId)
                        this.selected = true;
                });
                if (callback)
                    callback(d);
            }
            else
            {
                Service.connectionError = "Zoznam vozidiel je nedostupný";
                callback(d);
            }
        }, function () { callback([]) });
    },
    unBreak : function () {
        app.waiting();
        var s = Service.getSettings();
        Service.callService("TransporterUnBreak", {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            IsTransporter: true,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {
                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },
    alarm: function () {
        app.waiting();
        var s = Service.getSettings();
        Service.callService("TransporterAlarm", {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            IsTransporter: true,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {
                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },
    unAlarm: function () {
        app.waiting();
        var s = Service.getSettings();
        Service.callService("TransporterUnAlarm", {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            IsTransporter: true,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {
                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },
    recallOrder: function (callback) {
        app.waiting();
        var s = Service.getSettings();
        if (Service.orders && Service.orders.Current) {
            Service.callService( Service.orders.Current.RecallNeed ? "OrderUnRecall":"OrderRecall", {
                GUID_Transporter: s.transporterId,
                GUID_sysUser_Driver: s.userId,
                GUID_TransporterOrder: Service.orders.Current.GUID,
                IsTransporter: true,
                Latitude: PositionService.lat,
                Longitude: PositionService.lng
            },
            function () {
                Service.orders.Current.RecallNeed = Service.orders.Current.RecallNeed ? false : true;
                if (callback)
                    callback();
            }
            );
        }
    },
    getDetail: function (entity, id, callback) {
        this.callService("itemmobile", { Id: entity + "_" + id }, callback, callback);
    },
    getSettings: function () {
        if (!Service._settings || !Service._settings.url) {
            app.log("Service.getSettings");
            var s = window.localStorage.getItem("settings");
            app.log("Service.getSettings : " + s);
            if(s)
                Service._settings = JSON.parse(s);
            else
                Service._settings = {};
        }
        return Service._settings;
    },
    saveSettings: function (data) {

        if (Service.isChanged(data))
            Service.isSendloginHistory = false;

        if(data)
            Service._settings = data;
        window.localStorage.setItem("settings", JSON.stringify(Service._settings));
    },
    callService: function (method, data, successDelegate, errorDelegate) {
        app.log("Service.callService: " + method);
        Service.connectionError = null;
        if (!this._settings.url) {
            Service.connectionError = "Chýba adresa servisu";
            if (errorDelegate)
                errorDelegate(d);
        }
        else {
            if (data) {
                data.UserTicket = this._settings.sessionId;
                //data.GUID_sysUser_Driver = this._settings.userId;
            }
            $.post(this._settings.url + "/app/" + method, data)
                .done(function (d) {
                    if (d) {
                        app.log(method + ": OK");
                        if (d.Message) {
                            app.info(d.Message);
                        }

                        if (d.ErrorMessage) {
                            app.log("Service.callService - ErrorMessage: " + d.ErrorMessage);
                            Service.connectionError = d.ErrorMessage + " " + this.url;
                            if (errorDelegate)
                                errorDelegate(d);
                            else
                                app.showAlert(d.ErrorMessage + " " + this.url, "Chyba");
                        }
                        else if (d.RefreshDataId) {
                            if (d.oVer)
                                Service.ordersVer = d.oVer;
                            if (d.tVer)
                                Service.transporterVer = d.tVer;
                            app.refreshData(d.RefreshDataId, function () { if (successDelegate) successDelegate(d); });
                        }
                        else if(successDelegate)
                            successDelegate(d);
                    }
                    else if (successDelegate)
                       successDelegate();
                 })
                .fail(function () {
                    app.log("Service.callService - " + Service.connectionError + ": " + this.url);
                    app.waiting(false);
                    //Service.connectionError = "Spojenie sa nepodarilo " + this.url;
                    if (errorDelegate)
                        errorDelegate({ ErrorMessage: Service.connectionError });
                    else
                        app.showAlert(Service.connectionError + ": " + this.url, "Chyba");
                });
        }
    },
    parseJsonDate: function (jsonDate) {
        try{
            var offset = 0; // new Date().getTimezoneOffset() * 60000;
            var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);

            if (parts[2] == undefined)
                parts[2] = 0;

            if (parts[3] == undefined)
                parts[3] = 0;

            return new Date(+parts[1] + offset + parts[2] * 3600000 + parts[3] * 60000);
        }
        catch (err) {
            return undefined;
        }
    },
    formatJsonDate: function (jsonDate) {
        var d = Service.parseJsonDate(jsonDate);
        //return d.toLocaleDateString() + " <br/><strong>" + d.toLocaleTimeString().substring(0, 5) + "</strong>"; //
        if (d)
            return d.getDate() + ". " + d.getMonth() + ". " + d.getFullYear() + " " + d.toTimeString().substring(0, 5);
        return "";
    }
}