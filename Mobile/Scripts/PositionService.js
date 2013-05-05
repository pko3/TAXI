var PositionService = {
    lat:0,
    lng: 0,
    watchID: null,
    startWatch: function () {
        try {
            //{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
            //{ frequency: 3000 };
            this.watchID = navigator.geolocation.watchPosition(this.success, this.error, { frequency: 5000 });
        }
        catch (err) {
            this.watchID = null;
            Map.message(err.message, true);
        }
    },
    success: function (position) {
        //PositionService.date = new Date()();
        PositionService.lat = position.coords.latitude;
        PositionService.lng = position.coords.longitude;
    },
    error: function (err) {
        Map.message(err.message, true);
    },
    stopWatch: function () {
        navigator.geolocation.clearWatch(this.watchID);
        this.watchID = null;
    }
}