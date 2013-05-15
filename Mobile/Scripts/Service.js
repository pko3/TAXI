var Service = {
    online: false,
    transporter: null,
    isAuthenticated: false,
    isComplet: function () {
        return this.isAuthenticated && this._settings && this._settings.transporterId;
    },
    connectionError: undefined,
    _settings: {
        name: undefined,
        password: undefined,
        userId: undefined,
        transporterId: undefined,
        url: undefined,
        sessionId: undefined
    },
    initialize: function (callback) {
        //Cross domain !!!
        app.log("Service.initialize");
        $.support.cors = true;
        $.ajaxSetup({
            cache: false,
            timeout: 30000,
            error: function (jqXHR, textStatus, errorThrown) {
                switch (jqXHR.status) {
                    case 403: Service.connectionError = "Chybné prihlásenie"; break;
                    case 404: Service.connectionError = "Služba sa nenašla: " + this.url; break;
                    default: Service.connectionError = "Služba sa nenašla: " + this.url; break;
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

                Notification.initialize();
                PositionService.startWatch();
                Service.callService("TaxiSetHistory", { GUID_Transporter: s.transporterId, GUID_sysUser_Driver: s.userId, HistoryAction: "Driver login", IsTransporter: true },
                    function () { if (callback) callback(); }, function () { if (callback) callback(); });
            }, function (d) {
                PositionService.stopWatch();
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
    getOrders: function (callback) {
        this.callService("data/transporterorders", { IdTransporter: this._settings.transporterId }, callback);
    },
    getMessages: function (callback) {
        this.callService("data/transporterMessages", null, callback);
    },
    getTransporters: function (callback) {
        var self = this;
        this.callService("data/transporterssimple", null, function (d) {
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
            }
        }, function () { callback([]) });
    },
    getDetail: function (entity, id, callback) {
        this.callService("item/" + entity + "_" + id, null, callback, callback);
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
            $.post(this._settings.url + "/app/" + method, data)
                .done(function (d) {
                    if (d) {
                        app.info(method + ": OK");
                        app.log(method + ": OK");
                        if (d.Message) {
                            app.info(d.Message);
                        }
                        if (d.RefreshDataId) {
                            app.refreshData(d.RefreshDataId);
                        }
                        if (d.ErrorMessage) {
                            app.log("Service.callService - ErrorMessage: " + d.ErrorMessage);
                            Service.connectionError = d.ErrorMessage + " :" + this.url;
                            if (errorDelegate)
                                errorDelegate(d);
                            else
                                app.showAlert(d.ErrorMessage + " :" + this.url, "Error");
                        }
                        else if(successDelegate)
                            successDelegate(d);
                    }
                    else if (successDelegate)
                       successDelegate();
                 })
                .fail(function () {
                    app.log("Service.callService - Connection error: " + this.url);
                    app.waiting(false);
                    Service.connectionError = "Connection error :" + this.url;
                    if (errorDelegate)
                        errorDelegate({ ErrorMessage: "Connection error :" + this.url });
                    else
                        app.showAlert("Connection error :" + this.url, "Error");
                });
        }
    }
}