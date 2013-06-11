var PositionService = {
    lat:0,
    lng: 0,
    poolID: undefined,
    startWatch: function () {
        if (this.poolID)
            clearTimeout(this.poolID);
        this.poolID = setTimeout(PositionService.pool, 2000);
    },
    stopWatch: function () {
        if (this.poolID)
            clearTimeout(this.poolID);
        this.poolID = undefined;
    },
    pool: function () {
        try {
            if (Service.isComplet())
                navigator.geolocation.getCurrentPosition(
                    PositionService.success,
                    PositionService.error,
                    {
                        enableHighAccuracy: Service.getSettings().enableHighAccuracy ? true : false,
                        maximumAge: 1000
                    });
            else PositionService.startWatch();
        }
        catch (err) {
            PositionService.startWatch();
            app.info(err.message);
        }
    },
    success: function (position) {
        try {
            if (PositionService.lat != position.coords.latitude && PositionService.lng != position.coords.longitude) {
                app.info("Posielam pozíciu...");
                PositionService.lat = position.coords.latitude;
                PositionService.lng = position.coords.longitude;
                var s = Service.getSettings();
                Service.callService("MobilePool", {
                    Id: s.transporterId,
                    Lat: PositionService.lat,
                    Lng: PositionService.lng,
                },
                function () { PositionService.startWatch(); app.info(""); },
                function (d) { PositionService.startWatch(); app.info(d.ErrorMessage); });
            }
            else PositionService.startWatch();
        }
        catch (err) {
            PositionService.startWatch();
            app.info(err.message);
        }
    },
    error: function (err) {
        PositionService.startWatch();
        app.info(err.message);
    }
}