var PositionService = {
    lat:0,
    lng: 0,
    watchID: null,
    startWatch: function () {
        try {
            this.watchID = navigator.geolocation.watchPosition(this.success, this.error, { frequency: 2000 });
        }
        catch (err) {
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
    }
}