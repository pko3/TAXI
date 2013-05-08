var PositionService = {
    lat:0,
    lng: 0,
    watchID: null,
    poolID: null,
    startWatch: function () {
        try {
            //{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
            //{ frequency: 3000 };
            navigator.geolocation.getCurrentPosition(this.success, this.error);
            this.watchID = navigator.geolocation.watchPosition(this.success, this.error, { frequency: 5000 });
            if(this.poolID)
                clearInterval(this.poolID);
            this.poolID = setInterval(function () {
                app.info("Send...");
                Service.callService("MobilePool", {
                    Id : Service.transporter.GUID,
                    Lat: PositionService.lat,
                    Lng: PositionService.lng,
                },
                    function () { app.info(""); },
                    function (d) { app.info(d.ErrorMessage); });
            }, 60000);
        }
        catch (err) {
            this.watchID = null;
            Map.message(err.message, true);
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