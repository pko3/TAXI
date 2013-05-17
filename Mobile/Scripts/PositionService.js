var PositionService = {
    lat:0,
    lng: 0,
    watchID: null,
    poolID: null,
    startWatch: function () {
        try {
            //{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
            //{ frequency: 3000 };
            //this.watchID = navigator.geolocation.watchPosition(this.success, this.error, { frequency: 5000 });

            PositionService.pool();
            if (this.poolID)
                clearInterval(this.poolID);
            this.poolID = setInterval(function () {
                PositionService.pool();
            }, 60000);
        }
        catch (err) {
            this.watchID = null;
            Map.message(err.message, true);
        }
    },
    pool: function () {
        var s = Service.getSettings();
        if (Service.isAuthenticated && s.transporterId) {
            app.info("Send...");
            navigator.geolocation.getCurrentPosition(function (position) {
                PositionService.lat = position.coords.latitude;
                PositionService.lng = position.coords.longitude;
                Service.callService("MobilePool", {
                    Id: s.transporterId,
                    Lat: PositionService.lat,
                    Lng: PositionService.lng,
                },
                function () { app.info(""); },
                function (d) { app.info(d.ErrorMessage); });
            }, this.error);
        }
    },
    success: function (position) {
        app.info("Position...");
        PositionService.lat = position.coords.latitude;
        PositionService.lng = position.coords.longitude;
    },
    error: function (err) {
        app.info(err.message);
    },
    stopWatch: function () {
        navigator.geolocation.clearWatch(this.watchID);
        //clearInterval(this.poolID);
        this.watchID = null;
    }
}