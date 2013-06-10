var PositionService = {
    lat:0,
    lng: 0,
    poolID: undefined,
    startWatch: function () {
        try {
            if (this.poolID)
                clearInterval(this.poolID);
            this.poolID = setInterval(function () {
                PositionService.pool();
            }, 60000);
        }
        catch (err) {
            Map.message(err.message, true);
        }
    },
    pool: function () {
        if (Service.isComplet()) {
            app.info("Position...");
            navigator.geolocation.getCurrentPosition(this.success, this.error, { enableHighAccuracy: true, maximumAge: 0 });
        }
    },
    success: function (position) {
        if (PositionService.lat != position.coords.latitude && PositionService.lng != position.coords.longitude) {
            app.info("Position send...");
            PositionService.lat = position.coords.latitude;
            PositionService.lng = position.coords.longitude;
            var s = Service.getSettings();
            Service.callService("MobilePool", {
                Id: s.transporterId,
                Lat: PositionService.lat,
                Lng: PositionService.lng,
            },
            function () { app.info(""); },
            function (d) { app.info(d.ErrorMessage); });
        }
        else app.info("Position not changed");
    },
    error: function (err) {
        app.info(err.message);
    },
    stopWatch: function () {
        if (this.poolID)
            clearInterval(this.poolID);
        this.poolID = undefined;
    }
}