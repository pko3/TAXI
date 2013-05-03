var Service = {
    online: false,
    transporter: null,
    isAuthenticated: false,
    isComplet: function () {
        return this.isAuthenticated && this._settings && this._settings.transporterId;
    },
    connectionError: null,
    _settings: {
        name: null,
        password: null,
        transporterId: null,
        url: null,
        sessionId: null
    },
    initialize: function (callback) {
        //Cross domain !!!
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
        this.getSettings();
        if (this._settings.url && this._settings.name && this._settings.password)
            this.callService("login", { UserName: this._settings.name, Password: this._settings.password, RememberMe:true }, function (d) {
                Service.isAuthenticated = true;
                PositionService.startWatch();
                if (callback)
                    callback();
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
        if (!Service._settings || !Service._settings.url)
            Service._settings = JSON.parse(window.localStorage.getItem("settings")) || {};
        return Service._settings;
    },
    saveSettings: function (data) {
        Service._settings = data;
        window.localStorage.setItem("settings", JSON.stringify(Service._settings));
    },
    callService: function (method, data, successDelegate, errorDelegate) {
        Service.connectionError = null;
        if (!this._settings.url) {
            Service.connectionError = "Chýba adresa servisu";
            if (errorDelegate)
                errorDelegate(d);
        }
        else {
            $.post(this._settings.url + "/app/" + method, data)
                .done(function (d) {
                    if (d && d.ErrorMessage) {
                        Service.connectionError = d.ErrorMessage + " :" + this.url;
                        if (errorDelegate)
                            errorDelegate(d);
                        else
                            app.showAlert(d.ErrorMessage + " :" + this.url, "Error");
                    }
                    else if (successDelegate)
                        successDelegate(d);
                })
                .fail(function () {
                    $(".waitingDiv").hide();
                    Service.connectionError = "Connection error :" + this.url;
                    if (errorDelegate)
                        errorDelegate({ ErrorMessage: "Connection error :" + this.url });
                    else
                        app.showAlert("Connection error :" + this.url, "Error");
                });
        }
    }
}