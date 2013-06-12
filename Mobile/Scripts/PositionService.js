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
        this.poolID = undefined;
        if (Service.isComplet())
            try {
                navigator.geolocation.getCurrentPosition(
                    PositionService.success,
                    PositionService.error,
                    {
                        enableHighAccuracy: Service.getSettings().enableHighAccuracy ? true : false,
                        maximumAge: 1000
                    });
            }
                catch (err) {
                PositionService.callService(0, 0);
                app.info(err.message);
            }
        else PositionService.startWatch();
    },
    success: function (position) {
        var posChanged = PositionService.lat != position.coords.latitude && PositionService.lng != position.coords.longitude;
        if (posChanged) {
            PositionService.lat = position.coords.latitude;
            PositionService.lng = position.coords.longitude;
        }
        PositionService.callService(posChanged ? PositionService.lat : 0, posChanged ? PositionService.lng : 0);
    },
    error: function (err) {
        PositionService.callService(0, 0);
        app.info(err.message);
    },
    callService: function (lat, lng) {
        try {
            app.info("Posielam ...");
            var s = Service.getSettings();
            Service.callService("MobilePool", {
                Id: s.transporterId,
                Lat: lat,
                Lng: lng,
            },
            function (d) { PositionService.startWatch(); app.info(""); PositionService.refreshData(d); },
            function (d) { PositionService.startWatch(); app.info(d.ErrorMessage); PositionService.refreshData(d); });
        }
        catch (err) {
            PositionService.startWatch();
            app.info(err.message);
        }
    },
    refreshData: function (d) {
        if (d.oVer && d.oVer != Service.ordersVer) {
            Service.ordersVer = d.oVer;
            app.refreshData(["orders"]);
        }
        if (d.tVer && d.tVer != Service.transporterVer) {
            Service.transporterVer = d.tVer;
            app.refreshData(["transporters"]);
        }
    }
}